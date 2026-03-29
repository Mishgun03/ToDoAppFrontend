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

  describe("getTodos()", () => {
    it("calls apiClient with default page=0 and size=10", async () => {
      await getTodos();
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos?page=0&size=10&sort=createdAt,desc",
      );
    });

    it("passes custom page and size", async () => {
      await getTodos(2, 20);
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos?page=2&size=20&sort=createdAt,desc",
      );
    });


  });

  describe("getTodoById()", () => {
    it("calls apiClient with correct path", async () => {
      await getTodoById("abc-123");
      expect(mockedApiClient).toHaveBeenCalledWith("/todos/abc-123");
    });

    it("returns todo response", async () => {
      const mockTodo = { id: "abc-123", todoName: "Test" };
      mockedApiClient.mockResolvedValue(mockTodo);
      const result = await getTodoById("abc-123");
      expect(result).toEqual(mockTodo);
    });
  });

  describe("createTodo()", () => {


    it("sends FormData when files are provided", async () => {
      const data = { title: "Todo with files" };
      const file = new File(["content"], "test.txt", { type: "text/plain" });

      await createTodo(data, [file]);
      expect(mockedApiClient).toHaveBeenCalledWith("/todos", {
        method: "POST",
        body: expect.any(FormData),
      });
    });

    it("appends all files to FormData", async () => {
      const data = { title: "Multi-file" };
      const file1 = new File(["a"], "a.txt");
      const file2 = new File(["b"], "b.txt");

      await createTodo(data, [file1, file2]);

      const callArgs = mockedApiClient.mock.calls[0];
      const formData = callArgs[1]!.body as FormData;
      const files = formData.getAll("files");
      expect(files).toHaveLength(2);
    });


  });

  describe("updateTodo()", () => {
    it("sends JSON PUT when no files provided", async () => {
      const data = { title: "Updated" };
      await updateTodo("id-1", data);
      expect(mockedApiClient).toHaveBeenCalledWith("/todos/id-1", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    });

    it("sends FormData PUT when files provided", async () => {
      const data = { done: true };
      const file = new File(["c"], "c.txt");
      await updateTodo("id-1", data, [file]);
      expect(mockedApiClient).toHaveBeenCalledWith("/todos/id-1", {
        method: "PUT",
        body: expect.any(FormData),
      });
    });

    it("sends JSON when files array is empty", async () => {
      await updateTodo("id-1", { title: "T" }, []);
      expect(mockedApiClient).toHaveBeenCalledWith("/todos/id-1", {
        method: "PUT",
        body: JSON.stringify({ title: "T" }),
      });
    });
  });

  describe("deleteTodo()", () => {
    it("sends DELETE request with correct id", async () => {
      await deleteTodo("id-99");
      expect(mockedApiClient).toHaveBeenCalledWith("/todos/id-99", {
        method: "DELETE",
      });
    });
  });

  describe("searchTodos()", () => {
    it("sends search query with default pagination", async () => {
      await searchTodos("homework");
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos/search?q=homework&page=0&size=10",
      );
    });

    it("encodes special characters in query", async () => {
      await searchTodos("hello world");
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos/search?q=hello%20world&page=0&size=10",
      );
    });

    it("passes custom page and size", async () => {
      await searchTodos("test", 3, 25);
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos/search?q=test&page=3&size=25",
      );
    });
  });

  describe("filterTodos()", () => {
    it("sends filter with done=true", async () => {
      await filterTodos(true);
      expect(mockedApiClient).toHaveBeenCalledWith(
        expect.stringContaining("done=true"),
      );
    });

    it("sends filter with done=false", async () => {
      await filterTodos(false);
      expect(mockedApiClient).toHaveBeenCalledWith(
        expect.stringContaining("done=false"),
      );
    });

    it("sends filter with priority", async () => {
      await filterTodos(undefined, "HIGH");
      expect(mockedApiClient).toHaveBeenCalledWith(
        expect.stringContaining("priority=HIGH"),
      );
    });

    it("sends filter with both done and priority", async () => {
      await filterTodos(true, "BLOCKER", 1, 5);
      const url = mockedApiClient.mock.calls[0][0];
      expect(url).toContain("done=true");
      expect(url).toContain("priority=BLOCKER");
      expect(url).toContain("page=1");
      expect(url).toContain("size=5");
    });

    it("does not include done param when undefined", async () => {
      await filterTodos(undefined, "LOW");
      const url = mockedApiClient.mock.calls[0][0];
      expect(url).not.toContain("done=");
    });

    it("does not include priority param when undefined", async () => {
      await filterTodos(true);
      const url = mockedApiClient.mock.calls[0][0];
      expect(url).not.toContain("priority=");
    });

    it("uses default page=0 and size=10", async () => {
      await filterTodos(true, "HIGH");
      const url = mockedApiClient.mock.calls[0][0];
      expect(url).toContain("page=0");
      expect(url).toContain("size=10");
    });
  });

  describe("getSmartList()", () => {
    it("calls with default pagination", async () => {
      await getSmartList();
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos/smart-list?page=0&size=10",
      );
    });

    it("passes custom page and size", async () => {
      await getSmartList(5, 50);
      expect(mockedApiClient).toHaveBeenCalledWith(
        "/todos/smart-list?page=5&size=50",
      );
    });
  });
});
