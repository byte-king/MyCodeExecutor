import { Container, Grid, Paper } from "@mui/material";
import CodeEditor from "./components/CodeEditor";
import FileSystem from "./components/FileSystem";
import TerminalComponent from "./components/Terminal";
import { useEffect, useState } from "react";
import axios from "axios";

import { useRecoilValue } from "recoil";
import { fileKeyState } from "./fileKeyState";

function App() {
  const [fileSystemData, setFileSystemData] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const filePathKey = useRecoilValue(fileKeyState);

  useEffect(() => {
    console.log("Current FileKey", filePathKey);
    const FileData = async () => {
      try {
        const response = await axios.post("/api/get-file", {
          fileKey: filePathKey,
        });
        setFileContent(response.data.data);
      } catch (error) {
        console.error("Error fetching file content:", error);
      }
    };

    FileData();
  }, [filePathKey]);

  useEffect(() => {
    const ListFolderData = async () => {
      try {
        const response = await axios.post("/api/list-folder", {
          folderKey: "Replit-Clone/",
        });
        setFileSystemData(response.data);
      } catch (error) {
        console.error("Error fetching file system data:", error);
      }
    };

    ListFolderData();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <Container
      maxWidth="xl"
      sx={{ bgcolor: "#0f0a12", color: "gray.400" }}>
      <Grid
        container
        spacing={2}>
        <Grid
          item
          xs={12}
          md={6}>
          <Paper
            elevation={0}
            sx={{ height: "100%", bgcolor: "transparent" }}>
            {fileSystemData && <FileSystem folderList={fileSystemData} />}
          </Paper>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}>
          <Paper
            elevation={0}
            sx={{ height: "auto", bgcolor: "transparent" }}>
            <CodeEditor fileContent={fileContent} />
          </Paper>
          <Paper
            elevation={0}
            sx={{ height: "auto", bgcolor: "transparent" }}>
            {/* <CodeEditor fileContent={fileContent} /> */}
            <TerminalComponent />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default App;
