import { Box, Text,Menu,MenuButton,MenuList,MenuItem } from '@chakra-ui/react'
import React from 'react'

const LanguageSelector = () => {
  return (
    <Box>
        <Text mb={2}>Language: </Text>
        <Menu>
  <MenuButton as={Button}>
    Actions
  </MenuButton>
  <MenuList>
    <MenuItem>Download</MenuItem>
    <MenuItem>Create a Copy</MenuItem>
    <MenuItem>Mark as Draft</MenuItem>
    <MenuItem>Delete</MenuItem>
    <MenuItem>Attend a Workshop</MenuItem>
  </MenuList>
</Menu>
    </Box>
  )
}

export default LanguageSelector