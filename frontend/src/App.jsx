
import { Box, SimpleGrid } from "@chakra-ui/react"
import CodeEditor from "./components/CodeEditor"
import FileSystem from "./components/FileSystem"
function App() {
  return <Box minH="100vh" bg="#0f0a12" color="gray.400" px={5} py={8} >
    <SimpleGrid 
      columns={2} spacing="20px">
      <Box minH="100vh">
        <FileSystem/>
      </Box>
      <Box >
        <CodeEditor/>
      </Box>

    </SimpleGrid>
    </Box>
}

export default App
