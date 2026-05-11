import { describe, expect, test } from "vitest";
import { createRoute } from "./routeHelper.js";

describe("create Routes from pages", () => {
  describe("create Routes from SFC files", () => {
    test("should start with a '/'", () => {
      const routes = createRoute({
        "/src/pages/Foo.vue": null,
        "/src/pages/Home.vue": null,
      });
      expect(routes[0]).toHaveProperty("path", "/Foo");
    });

    test("should create route for Home.vue", () => {
      const routes = createRoute({
        "/src/pages/Home.vue": null,
      });
      expect(routes).toEqual([
        {
          name: "Home",
          path: "/",
          component: null,
          children: [],
          meta: {},
          props: true,
        },
      ]);
    });

    test("should create dynamic route", () => {
      const routes = createRoute({
        "/src/pages/[ID].vue": null,
        "/src/pages/Home.vue": null,
      });
      expect(routes[0]).toEqual({
        name: ":ID",
        path: "/:ID",
        component: null,
        children: [],
        meta: {},
        props: true,
      });
    });

    test("should create dynamic route with multiple params", () => {
      const routes = createRoute({
        "/src/pages/users/[username]/posts/[postId].vue": null,
        "/src/pages/users/[username]/posts/Layout.vue": null,
        "/src/pages/users/[username]/Layout.vue": null,
        "/src/pages/users/Layout.vue": null,
        "/src/pages/Home.vue": null,
      });

      expect(routes[0].children[0].children[0].children[0].name).toBe(
        "users-:username-posts-:postId",
      );
    });
  });

  describe("create Routes from folder", () => {
    test("should create route from folder", () => {
      const routes = createRoute({
        "/src/pages/Parent/Layout.vue": null,
      });
      expect(routes).toEqual([
        {
          name: "Parent", // folder name
          path: "/Parent",
          component: null,
          children: [],
          meta: {},
          props: true,
        },
      ]);
    });

    test("should create nested route from folder", () => {
      const routes = createRoute({
        "/src/pages/Parent/Layout.vue": null,
        "/src/pages/Parent/Home.vue": null, // default child
        "/src/pages/Parent/Child.vue": null,
        "/src/pages/Home.vue": null,
      });
      expect(routes[0]).toEqual({
        name: "Parent",
        path: "/Parent",
        component: null,
        children: [
          {
            name: "Parent-Home",
            path: "",
            component: null,
            children: [],
            meta: {},
            props: true,
          },
          {
            name: "Parent-Child",
            path: "Child",
            component: null,
            children: [],
            meta: {},
            props: true,
          },
        ],
        meta: {},
        props: true,
      });
    });

    test("should throw error when folder missing Layout.vue", () => {
      expect(() =>
        createRoute({
          "/src/pages/Parent/Home.vue": null,
          "/src/pages/Parent/Child.vue": null,
        }),
      ).toThrow();
    });
  });
});
