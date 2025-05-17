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
import UserGroupGuard from "@/components/auth/user-group-guard";

export default function NewResource() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">
          <Icons.packagePlus className="h-5 w-5 me-1 text-white" />{" "}
          <span className="text-white">Registrar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>


          <DropdownMenuItem asChild>
            <Link href="/equipments/add" className="flex flex-row">
              <Icons.computer className="mr-2 h-4 w-4" />
              <span>Equipamento</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/requests/add" className="flex flex-row">
              <Icons.fileText className="mr-2 h-4 w-4" />
              <span>Requisição</span>
            </Link>
          </DropdownMenuItem>

          <UserGroupGuard allowedGroups={["Admins"]}>
          <DropdownMenuItem asChild>
            <Link href="/users/add" className="flex flex-row">
              <Icons.user className="mr-2 h-4 w-4" />
              <span>Utilizador</span>
            </Link>
          </DropdownMenuItem>
          </UserGroupGuard>

        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
