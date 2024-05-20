// import React from "react";
import { DiCss3, DiJavascript, DiNpm } from "react-icons/di";
import {
  FaHtml5,
  FaList,
  FaPython,
  FaReact,
  FaRegFolder,
  FaRegFolderOpen,
} from "react-icons/fa";
import TreeView, { flattenTree } from "react-accessible-treeview";
import "../assets/FileSystemStyles.css";
import { useEffect, useState } from "react";
import axios from "axios";

const folder = {
  name: "",
  children: [
    {
      name: "src",
      children: [
        { name: "index.js" },
        { name: "styles.css" },
        { name: "temp.py" },
        { name: "About.tsx" },
      ],
    },
    {
      name: "node_modules",
      children: [
        {
          name: "react-accessible-treeview",
          children: [{ name: "index.js" }],
        },
        { name: "react", children: [{ name: "index.js" }] },
      ],
    },
    {
      name: ".npmignore",
    },
    {
      name: "package.json",
    },
    {
      name: "webpack.config.js",
    },
  ],
};

let FolderPath = {};

function correctName(folderValues) {
  folderValues.map((folder) => {
    // folder.metadata = folder.name;
    FolderPath[folder.id] =
      (folderValues[folder.parent]
        ? folderValues[folder.parent].name + "/"
        : "") + folder.name;

    folder.name = folder.name.split("/").pop();
  });
  console.log("folder path", FolderPath);
  console.log(folderValues);
  return folderValues;
}

function FileSystem() {
  const [folderData, setFolderData] = useState(folder);

  useEffect(() => {
    async function GetData() {
      const response = await axios.post("/api/list-folder", {
        folderKey: "Replit-Clone",
      });
      // console.log("Response", response);
      setFolderData(response.data);
    }
    // console.log(flattenTree(folderData));
    GetData();
  }, []);
  return (
    <div>
      <div className="directory">
        <TreeView
          data={correctName(flattenTree(folderData))}
          aria-label="directory tree"
          nodeRenderer={({
            element,
            isBranch,
            isExpanded,
            getNodeProps,
            level,
          }) => (
            <div
              {...getNodeProps()}
              style={{ paddingLeft: 20 * (level - 1), display: "flex" }}>
              {isBranch ? (
                <div
                  onClick={() => {
                    console.log("Folder Clicked");
                  }}>
                  <FolderIcon isOpen={isExpanded} />
                </div>
              ) : (
                <div
                  onClick={() => {
                    console.log(
                      `File icon with name ${element.name} and path${
                        FolderPath[element.id]
                      } clicked
                    `
                    );
                    console.log("This is folderPath", FolderPath);
                  }}>
                  <FileIcon filename={element.name} />
                </div>
              )}

              {element.name}
            </div>
          )}
        />
      </div>
    </div>
  );
}

const FolderIcon = ({ isOpen }) =>
  isOpen ? (
    <FaRegFolderOpen
      color="e8a87c"
      className="icon"
      style={{ width: "25px", height: "25px" }}
    />
  ) : (
    <FaRegFolder
      color="e8a87c"
      className="icon"
      style={{ width: "25px", height: "25px" }}
    />
  );

const FileIcon = ({ filename }) => {
  const extension = filename.slice(filename.lastIndexOf(".") + 1).toLowerCase();
  let IconComponent;

  // Determine the icon based on the file extension
  switch (extension) {
    case "js":
      IconComponent = (
        <DiJavascript
          color="yellow"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    case "css":
      IconComponent = (
        <DiCss3
          color="turquoise"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    case "json":
      IconComponent = (
        <FaList
          color="yellow"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    case "npmignore":
      IconComponent = (
        <DiNpm
          color="red"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    case "jsx":
    case "tsx":
      IconComponent = (
        <FaReact
          color="blue"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    case "py":
      IconComponent = (
        <FaPython
          color="blue"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    case "html":
      IconComponent = (
        <FaHtml5
          color="orange"
          className="icon"
          style={{ width: "20px", height: "20px" }}
        />
      );
      break;
    default:
      return null;
  }

  return IconComponent;
};

export default FileSystem;
