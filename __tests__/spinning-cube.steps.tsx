import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

const feature = loadFeature("./features/spinning-cube.feature");

jest.mock("three", () => ({
  Scene: jest.fn(() => ({ add: jest.fn() })),
  PerspectiveCamera: jest.fn(() => ({ position: { z: 0 } })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement("canvas"),
  })),
  BoxGeometry: jest.fn(() => ({ dispose: jest.fn() })),
  MeshStandardMaterial: jest.fn(() => ({ dispose: jest.fn() })),
  Mesh: jest.fn(() => ({ rotation: { x: 0, y: 0 } })),
  DirectionalLight: jest.fn(() => ({ position: { set: jest.fn() } })),
  AmbientLight: jest.fn(),
}));

defineFeature(feature, (test) => {
  test("The spinning cube is displayed on the main screen", ({
    given,
    then,
    and,
  }) => {
    given("the app has loaded", () => {
      render(<App />);
    });

    then(/^I should see the title "(.*)"$/, (title: string) => {
      expect(screen.getByText(title)).toBeTruthy();
    });

    and("I should see the spinning cube", () => {
      expect(screen.getByTestId("spinning-cube")).toBeTruthy();
    });
  });
});
