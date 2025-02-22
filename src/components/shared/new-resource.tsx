import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export default function NewResource() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          <Icons.packagePlus className="h-5 w-5 me-2 text-white" />{" "}
          <span className="text-white">Novo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>


          <DropdownMenuItem>
            <Link href="/equipments/add" className="flex flex-row">
              <Icons.computer className="mr-2 h-4 w-4" />
              <span>Equipamento</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Link href="/users/new" className="flex flex-row">
              <Icons.user className="mr-2 h-4 w-4" />
              <span>Utilizador</span>
            </Link>
          </DropdownMenuItem>

        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
