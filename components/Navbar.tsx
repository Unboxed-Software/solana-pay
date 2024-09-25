import {
  MenuButton,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  IconButton,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { locations } from "@/utils/locations";
import Link from "next/link";

// Define the interface for the location object if it's not defined elsewhere
interface Location {
  index: number;
  // Add other properties as needed
}

// Define props for Navbar if it ever needs to accept props
interface NavbarProps {
  // Add props here if needed
}

const Navbar: React.FC<NavbarProps> = () => {
  return (
    <Flex px={4} py={4}>
      <Menu>
        <MenuButton 
          as={IconButton} 
          icon={<HamburgerIcon />} 
          variant="outline"
          aria-label="Open navigation menu"
        />
        <MenuList>
          <MenuItem as={Link} href="/" passHref>
            SOL Transfer
          </MenuItem>
          {locations.map((location: Location) => (
            <MenuItem 
              key={location.index} 
              as={Link} 
              href={`/location/${location.index}`}
              passHref
            >
              Location {location.index}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Flex>
  );
};

export default Navbar;
