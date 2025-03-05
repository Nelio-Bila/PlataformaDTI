// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { ChevronRight } from "lucide-react";
// import { Fragment } from "react";

// type BreadcrumbItemProps = {
//   title: string;
//   link: string;
// };

// export function Breadcrumbs({ items }: { items: BreadcrumbItemProps[] }) {
//   return (
//     <Breadcrumb>
//       <BreadcrumbList>
//         {items.map((item, index) => (
//           <Fragment key={item.title}>
//             {index !== items.length - 1 && (
//               <BreadcrumbItem>
//                 <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
//               </BreadcrumbItem>
//             )}
//             {index < items.length - 1 && (
//               <BreadcrumbSeparator>
//                 <ChevronRight />
//               </BreadcrumbSeparator>
//             )}
//             {index === items.length - 1 && (
//               <BreadcrumbPage>{item.title}</BreadcrumbPage>
//             )}
//           </Fragment>
//         ))}
//       </BreadcrumbList>
//     </Breadcrumb>
//   );
// }



import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

// Update BreadcrumbItemProps to make link optional
type BreadcrumbItemProps = {
  title: string;
  link?: string; // Changed to optional
};

export function Breadcrumbs({ items }: { items: BreadcrumbItemProps[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.title}>
            {index !== items.length - 1 && item.link ? ( // Check if link exists for non-last items
              <BreadcrumbItem>
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            ) : (
              <BreadcrumbPage>{item.title}</BreadcrumbPage> // Last item or no link uses BreadcrumbPage
            )}
            {index < items.length - 1 && (
              <BreadcrumbSeparator>
                <ChevronRight />
              </BreadcrumbSeparator>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}