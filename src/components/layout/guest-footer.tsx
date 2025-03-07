import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/logo.png";

const GuestFooter = () => {
  return (
    <div className="flex flex-col">
      <div className="grow bg-muted" />
      <footer>
        <div className="max-w-screen-xl mx-auto">

          <Separator />
          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-x-2 gap-y-4 px-6 xl:px-0">
            {/* Logo */}
            <Link
            href={"/"}
            className="flex justify-center content-center text-center">
            <Image
              src={Logo}
              width={100}
              height={100}
              alt="Logotipo do HCM"
            />
          </Link>

            {/* Copyright */}
            <span className="text-muted-foreground">
              &copy; {new Date().getFullYear()}{" "}
              <Link href="/" target="_blank">
                Departamento de Tecnologias de Informação - Hospital Central de Maputo
              </Link>
              . Todos direitos reservados.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GuestFooter;
