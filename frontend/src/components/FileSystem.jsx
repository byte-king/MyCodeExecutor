import * as React from "react";
import clsx from "clsx";
import { animated, useSpring } from "@react-spring/web";
import { styled, alpha } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import FolderRounded from "@mui/icons-material/FolderRounded";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { treeItemClasses } from "@mui/x-tree-view/TreeItem";
import { unstable_useTreeItem2 as useTreeItem2 } from "@mui/x-tree-view/useTreeItem2";
import {
  TreeItem2Checkbox,
  TreeItem2Content,
  TreeItem2IconContainer,
  TreeItem2Label,
  TreeItem2Root,
} from "@mui/x-tree-view/TreeItem2";
import { TreeItem2Icon } from "@mui/x-tree-view/TreeItem2Icon";
import { TreeItem2Provider } from "@mui/x-tree-view/TreeItem2Provider";

import { IoLogoJavascript } from "react-icons/io5";
import {
  FaReact,
  FaGitAlt,
  FaHtml5,
  FaCss3Alt,
  FaEnvelopeOpenText,
  FaFolder,
  FaFolderMinus,
} from "react-icons/fa";
import { FaMarkdown } from "react-icons/fa";

import { BsFiletypeJson } from "react-icons/bs";

import { useTreeViewApiRef } from "@mui/x-tree-view/hooks";
import { useRecoilState, useSetRecoilState } from "recoil";
import { fileKeyState } from "../fileKeyState";

const getIconFromFileType = (fileType, status) => {
  // console.log("This is filetype", fileType);
  switch (fileType) {
    case "ts":
    case "cjs":
    case "mjs":
    case "js":
      return IoLogoJavascript;
    case "jsx":
      return FaReact;
    case "gitignore":
      return FaGitAlt;
    case "html":
      return FaHtml5;
    case "folder":
      return status.expanded ? FaFolderMinus : FaFolder;
    case "md":
      return FaMarkdown;
    case "css":
      return FaCss3Alt;
    case "json":
      return BsFiletypeJson;
    default:
      return FaEnvelopeOpenText;
  }
};

const StyledTreeItemRoot = styled(TreeItem2Root)(({ theme }) => ({
  color:
    theme.palette.mode === "light"
      ? theme.palette.grey[800]
      : theme.palette.grey[400],
  position: "relative",
  [`& .${treeItemClasses.groupTransition}`]: {
    marginLeft: theme.spacing(3.5),
  },
}));

const CustomTreeItemContent = styled(TreeItem2Content)(({ theme }) => ({
  flexDirection: "row-reverse",
  borderRadius: theme.spacing(0.7),
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  paddingRight: theme.spacing(1),
  fontWeight: 500,
  [`& .${treeItemClasses.iconContainer}`]: {
    marginRight: theme.spacing(2),
  },
  [`&.Mui-expanded `]: {
    "&:not(.Mui-focused, .Mui-selected, .Mui-selected.Mui-focused) .labelIcon":
      {
        color:
          theme.palette.mode === "light"
            ? theme.palette.primary.main
            : theme.palette.primary.dark,
      },
    "&::before": {
      content: '""',
      display: "block",
      position: "absolute",
      left: "16px",
      top: "44px",
      height: "calc(100% - 48px)",
      width: "1.5px",
      backgroundColor:
        theme.palette.mode === "light"
          ? theme.palette.grey[300]
          : theme.palette.grey[700],
    },
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color:
      theme.palette.mode === "light" ? theme.palette.primary.main : "white",
  },
  [`&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused`]: {
    backgroundColor:
      theme.palette.mode === "light"
        ? theme.palette.primary.main
        : theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  },
}));

const AnimatedCollapse = animated(Collapse);

function TransitionComponent(props) {
  const style = useSpring({
    to: {
      opacity: props.in ? 1 : 0,
      transform: `translate3d(0,${props.in ? 0 : 20}px,0)`,
    },
  });

  return (
    <AnimatedCollapse
      style={style}
      {...props}
    />
  );
}

const StyledTreeItemLabelText = styled(Typography)({
  color: "inherit",
  fontFamily: "General Sans",
  fontWeight: 500,
});

function CustomLabel({ icon: Icon, expandable, children, ...other }) {
  return (
    <TreeItem2Label
      {...other}
      sx={{
        display: "flex",
        alignItems: "center",
      }}>
      {Icon && (
        <Box
          component={Icon}
          className="labelIcon"
          color="Black"
          sx={{ mr: 1, fontSize: "1.2rem" }}
        />
      )}

      <StyledTreeItemLabelText variant="body2">
        {children}
      </StyledTreeItemLabelText>
    </TreeItem2Label>
  );
}

const isExpandable = (reactChildren) => {
  if (Array.isArray(reactChildren)) {
    return reactChildren.length > 0 && reactChildren.some(isExpandable);
  }
  return Boolean(reactChildren);
};

const CustomTreeItem = React.forwardRef(function CustomTreeItem(props, ref) {
  const { id, itemId, label, disabled, children, ...other } = props;

  const {
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getLabelProps,
    getGroupTransitionProps,
    status,
    publicAPI,
  } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

  const item = publicAPI.getItem(itemId);
  const expandable = isExpandable(children);
  let icon;
  // console.log("This is item", item.type);
  if (item.type) {
    icon = getIconFromFileType(item.type, status);
  }

  return (
    <TreeItem2Provider itemId={itemId}>
      <StyledTreeItemRoot {...getRootProps(other)}>
        <CustomTreeItemContent
          {...getContentProps({
            className: clsx("content", {
              "Mui-expanded": status.expanded,
              "Mui-selected": status.selected,
              "Mui-focused": status.focused,
              "Mui-disabled": status.disabled,
            }),
          })}>
          <TreeItem2IconContainer {...getIconContainerProps()}>
            <TreeItem2Icon status={status} />
          </TreeItem2IconContainer>
          {/* <TreeItem2Checkbox {...getCheckboxProps()} /> */}
          <CustomLabel
            {...getLabelProps({
              icon,
              expandable: expandable && status.expanded,
            })}
          />
        </CustomTreeItemContent>
        {children && <TransitionComponent {...getGroupTransitionProps()} />}
      </StyledTreeItemRoot>
    </TreeItem2Provider>
  );
});

export default function FileSystem({ folderList }) {
  // const toggledItemRef = React.useRef({});
  const [fileKey, setFileKey] = useRecoilState(fileKeyState);
  const apiRef = useTreeViewApiRef();

  const handleItemSelectionToggle = (event, itemId, isSelected) => {
    const item = apiRef.current.getItem(itemId);
    // console.log("This is item ", item);
    if (item.children.length === 0) setFileKey(item.id);
    // check if it is actually a file
  };

  return (
    <RichTreeView
      items={[folderList]}
      aria-label="file explorer"
      defaultExpandedItems={["Replit-Clone/", "Replit-Clone/base-node/"]}
      defaultSelectedItems="Replit-Clone/"
      apiRef={apiRef}
      sx={{
        height: "fit-content",
        flexGrow: 1,
        maxWidth: 400,
        overflowY: "auto",
        bgcolor: "whitesmoke",
      }}
      slots={{
        item: CustomTreeItem,
      }}
      onItemSelectionToggle={handleItemSelectionToggle}
    />
  );
}
