import { defineFeature, loadFeature } from "jest-cucumber";
import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../App";

const feature = loadFeature("./features/spinning-cube.feature");

jest.mock("expo-gl", () => {
  const React = require("react");
  return {
    GLView: function MockGLView(props: any) {
      return React.createElement("div", { "data-testid": props.testID, style: props.style });
    },
  };
});

jest.mock("expo-three", () => ({
  Renderer: jest.fn(),
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
