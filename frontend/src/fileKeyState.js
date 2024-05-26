// fileKeyState.js
import { atom } from "recoil";

export const fileKeyState = atom({
  key: "fileKeyState",
  default: "Replit-Clone/base-react/.eslintrc.cjs", // Default to null, indicating no file is selected initially
});
