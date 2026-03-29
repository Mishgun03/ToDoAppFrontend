import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/shared/api/client", () => ({
  apiClient: vi.fn(),
}));

import {
  getTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  searchTodos,
  filterTodos,
  getSmartList,
} from "@/features/todos/api";
import { apiClient } from "@/shared/api/client";

const mockedApiClient = vi.mocked(apiClient);

describe("todos API", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedApiClient.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    {
      name: "default pagination",
      call: () => getTodos(),
      path: "/todos?page=0&size=10&sort=createdAt,desc",
    },
    {
      name: "custom page and size",
      call: () => getTodos(2, 20),
      path: "/todos?page=2&size=20&sort=createdAt,desc",
    },
  ])("getTodos: $name", async ({ call, path }) => {
    await call();
    expect(mockedApiClient).toHaveBeenCalledWith(path);
  });

  it("getTodoById forwards id and returns apiClient result", async () => {
    const mockTodo = { id: "abc-123", todoName: "Test" };
    mockedApiClient.mockResolvedValue(mockTodo);
    await expect(getTodoById("abc-123")).resolves.toEqual(mockTodo);
    expect(mockedApiClient).toHaveBeenCalledWith("/todos/abc-123");
  });

  it("createTodo without files sends JSON POST", async () => {
    const data = { title: "Only json" };
    await createTodo(data);
    expect(mockedApiClient).toHaveBeenCalledWith("/todos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

  it("createTodo with files sends FormData with todo JSON blob and all files", async () => {
    const data = { title: "Multi-file" };
    const file1 = new File(["a"], "a.txt");
    const file2 = new File(["b"], "b.txt");

    await createTodo(data, [file1, file2]);

    expect(mockedApiClient).toHaveBeenCalledWith("/todos", {
      method: "POST",
      body: expect.any(FormData),
    });
    const formData = mockedApiClient.mock.calls[0][1]!.body as FormData;
    const todoBlob = formData.get("todo") as Blob;
    expect(JSON.parse(await todoBlob.text())).toEqual(data);
    expect(formData.getAll("files")).toEqual([file1, file2]);
  });

  it("updateTodo sends JSON PUT when no files; FormData when files; JSON when files is []", async () => {
    await updateTodo("id-1", { title: "Updated" });
    expect(mockedApiClient).toHaveBeenLastCalledWith("/todos/id-1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated" }),
    });

    const file = new File(["c"], "c.txt");
    await updateTodo("id-1", { done: true }, [file]);
    expect(mockedApiClient).toHaveBeenLastCalledWith("/todos/id-1", {
      method: "PUT",
      body: expect.any(FormData),
    });

    await updateTodo("id-1", { title: "T" }, []);
    expect(mockedApiClient).toHaveBeenLastCalledWith("/todos/id-1", {
      method: "PUT",
      body: JSON.stringify({ title: "T" }),
    });
  });

  it("deleteTodo sends DELETE with id", async () => {
    await deleteTodo("id-99");
    expect(mockedApiClient).toHaveBeenCalledWith("/todos/id-99", {
      method: "DELETE",
    });
  });

  it.each([
    {
      name: "default pagination",
      call: () => searchTodos("homework"),
      path: "/todos/search?q=homework&page=0&size=10",
    },
    {
      name: "encoded query and custom page/size",
      call: () => searchTodos("hello world", 3, 25),
      path: "/todos/search?q=hello%20world&page=3&size=25",
    },
  ])("searchTodos: $name", async ({ call, path }) => {
    await call();
    expect(mockedApiClient).toHaveBeenCalledWith(path);
  });

  it.each([
    {
      name: "done, priority, pagination",
      call: () => filterTodos(true, "BLOCKER", 1, 5),
      path: "/todos/filter?done=true&priority=BLOCKER&page=1&size=5",
    },
    {
      name: "priority only (no done)",
      call: () => filterTodos(undefined, "LOW"),
      path: "/todos/filter?priority=LOW&page=0&size=10",
    },
    {
      name: "done only (no priority)",
      call: () => filterTodos(true),
      path: "/todos/filter?done=true&page=0&size=10",
    },
  ])("filterTodos: $name", async ({ call, path }) => {
    await call();
    expect(mockedApiClient).toHaveBeenCalledWith(path);
  });

  it.each([
    {
      name: "defaults",
      call: () => getSmartList(),
      path: "/todos/smart-list?page=0&size=10",
    },
    {
      name: "custom page/size",
      call: () => getSmartList(5, 50),
      path: "/todos/smart-list?page=5&size=50",
    },
  ])("getSmartList: $name", async ({ call, path }) => {
    await call();
    expect(mockedApiClient).toHaveBeenCalledWith(path);
  });
});
