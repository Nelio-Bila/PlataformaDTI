// import { PrismaClient } from "@prisma/client";
// import { hash } from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//     // Delete all existing data
//     await prisma.userGroup.deleteMany({});
//     await prisma.groupPermission.deleteMany({});
//     await prisma.permission.deleteMany({});
//     await prisma.group.deleteMany({});
//     await prisma.user.deleteMany({});
//     await prisma.requestItem.deleteMany({});
//     await prisma.request.deleteMany({});
//     await prisma.equipmentImage.deleteMany({});
//     await prisma.equipment.deleteMany({});
//     await prisma.repartition.deleteMany({});
//     await prisma.sector.deleteMany({});
//     await prisma.service.deleteMany({});
//     await prisma.department.deleteMany({});
//     await prisma.direction.deleteMany({});

//     // Seed Directions
//     const directionsData = [
//         { name: "Geral" },
//         { name: "Clínica" },
//         { name: "Administrativa" },
//         { name: "Enfermagem" },
//         { name: "Científica e Pedagógica" },
//     ];
//     await prisma.direction.createMany({ data: directionsData });

//     const directionGeral = await prisma.direction.findFirst({ where: { name: "Geral" } });
//     const directionClinica = await prisma.direction.findFirst({ where: { name: "Clínica" } });
//     const directionAdministrativa = await prisma.direction.findFirst({ where: { name: "Administrativa" } });
//     const directionEnfermagem = await prisma.direction.findFirst({ where: { name: "Enfermagem" } });
//     const directionCientificaPedagogica = await prisma.direction.findFirst({ where: { name: "Científica e Pedagógica" } });

//     // Seed Departments under Direção Clínica
//     const departmentsClinicaData = [
//         { name: "Cirurgia", direction_id: directionClinica.id },
//         { name: "Medicina", direction_id: directionClinica.id },
//         { name: "Pediatria", direction_id: directionClinica.id },
//         { name: "Ortopedia", direction_id: directionClinica.id },
//         { name: "Ginecologia e Obstetrícia", direction_id: directionClinica.id },
//         { name: "Medicina Física e Reabilitação", direction_id: directionClinica.id },
//         { name: "Clínica Especial", direction_id: directionClinica.id },
//         { name: "Oncologia", direction_id: directionClinica.id },
//         { name: "Laboratório Clínico", direction_id: directionClinica.id },
//         { name: "Anatomia Patológica", direction_id: directionClinica.id },
//         { name: "Farmácia", direction_id: directionClinica.id },
//     ];
//     await prisma.department.createMany({ data: departmentsClinicaData });

//     // Seed Departments under Direção Administrativa
//     const departmentsAdministrativaData = [
//         { name: "Controle Interno", direction_id: directionAdministrativa.id },
//         { name: "Planejamento e Estatística", direction_id: directionAdministrativa.id },
//         { name: "Recursos Humanos", direction_id: directionAdministrativa.id },
//         { name: "Financeiro", direction_id: directionAdministrativa.id },
//         { name: "UGEIA", direction_id: directionAdministrativa.id },
//         { name: "Património", direction_id: directionAdministrativa.id },
//         { name: "Manutenção Hospitalar", direction_id: directionAdministrativa.id },
//         { name: "Tecnologias de Informação", direction_id: directionAdministrativa.id },
//     ];
//     await prisma.department.createMany({ data: departmentsAdministrativaData });

//     // Fetch Departments for later use
//     const deptCirurgia = await prisma.department.findFirst({ where: { name: "Cirurgia" } });
//     const deptMedicina = await prisma.department.findFirst({ where: { name: "Medicina" } });
//     const deptPediatria = await prisma.department.findFirst({ where: { name: "Pediatria" } });
//     const deptOrtopedia = await prisma.department.findFirst({ where: { name: "Ortopedia" } });
//     const deptGinecologiaObstetricia = await prisma.department.findFirst({ where: { name: "Ginecologia e Obstetrícia" } });
//     const deptMedicinaFisicaReabilitacao = await prisma.department.findFirst({ where: { name: "Medicina Física e Reabilitação" } });
//     const deptClinicaEspecial = await prisma.department.findFirst({ where: { name: "Clínica Especial" } });
//     const deptOncologia = await prisma.department.findFirst({ where: { name: "Oncologia" } });
//     const deptLaboratorio = await prisma.department.findFirst({ where: { name: "Laboratório Clínico" } });
//     const deptAnatomiaPatologica = await prisma.department.findFirst({ where: { name: "Anatomia Patológica" } });
//     const deptFarmacia = await prisma.department.findFirst({ where: { name: "Farmácia" } });
//     const deptControleInterno = await prisma.department.findFirst({ where: { name: "Controle Interno" } });
//     const deptPlanejamentoEstastistica = await prisma.department.findFirst({ where: { name: "Planejamento e Estatística" } });
//     const deptRecursosHumanos = await prisma.department.findFirst({ where: { name: "Recursos Humanos" } });
//     const deptFinanceiro = await prisma.department.findFirst({ where: { name: "Financeiro" } });
//     const deptUGEIA = await prisma.department.findFirst({ where: { name: "UGEIA" } });
//     const deptPatrimonio = await prisma.department.findFirst({ where: { name: "Património" } });
//     const deptManutencaoHospitalar = await prisma.department.findFirst({ where: { name: "Manutenção Hospitalar" } });
//     const deptTecnologiasInformacao = await prisma.department.findFirst({ where: { name: "Tecnologias de Informação" } });

//     // Seed Services under Direção Administrativa
//     const servicesAdministrativaData = [
//         { name: "Alimentação, Nutrição e Dietética", direction_id: directionAdministrativa.id },
//         { name: "Lavandaria Hospitalar", direction_id: directionAdministrativa.id },
//         { name: "Apoio Geral", direction_id: directionAdministrativa.id },
//         { name: "Segurança Interna", direction_id: directionAdministrativa.id },
//         { name: "Relações Públicas", direction_id: directionAdministrativa.id },
//         { name: "Acesso Social", direction_id: directionAdministrativa.id },
//         { name: "Administração dos Departamentos Clínicos", direction_id: directionAdministrativa.id },
//         { name: "Administração do Departamento de Pediatria", direction_id: directionAdministrativa.id },
//         { name: "Administração do Departamento de Medicina", direction_id: directionAdministrativa.id },
//         { name: "Administração do Departamento de Cirurgia", direction_id: directionAdministrativa.id },
//         { name: "Administração do Departamento de Ortopedia", direction_id: directionAdministrativa.id },
//         { name: "Administração do Departamento de Ginecologia e Obstetrícia", direction_id: directionAdministrativa.id },
//     ];
//     await prisma.service.createMany({ data: servicesAdministrativaData });

//     // Seed Services under Direção Clínica
//     const servicesClinicaData = [
//         { name: "Banco de Sangue", department_id: deptMedicina.id },
//         { name: "Laboratório de Análises Clínicas", department_id: deptLaboratorio.id },
//         { name: "Anatomia Patológica", department_id: deptAnatomiaPatologica.id },
//         { name: "Medicina Legal", department_id: deptMedicina.id },
//         { name: "Bloco Operatório", department_id: deptCirurgia.id },
//         { name: "Radiologia e Imagiologia", department_id: deptMedicina.id },
//         { name: "Farmácia", department_id: deptFarmacia.id },
//         { name: "Anestesiologia", department_id: deptMedicina.id },
//         { name: "Urgências de Adultos", department_id: deptMedicina.id },
//         { name: "Unidade de Cuidados Intensivos", department_id: deptMedicina.id },
//         { name: "Unidade de Genética", department_id: deptMedicina.id },
//     ];
//     await prisma.service.createMany({ data: servicesClinicaData });

//     // Fetch Services for later use
//     const serviceBancoSangue = await prisma.service.findFirst({ where: { name: "Banco de Sangue" } });
//     const serviceLabAnalisesClinicas = await prisma.service.findFirst({ where: { name: "Laboratório de Análises Clínicas" } });
//     const serviceAnatomiaPatologica = await prisma.service.findFirst({ where: { name: "Anatomia Patológica" } });
//     const serviceMedicinaLegal = await prisma.service.findFirst({ where: { name: "Medicina Legal" } });
//     const serviceBlocoOperatorio = await prisma.service.findFirst({ where: { name: "Bloco Operatório" } });
//     const serviceRadiologiaImagem = await prisma.service.findFirst({ where: { name: "Radiologia e Imagiologia" } });
//     const serviceFarmarcia = await prisma.service.findFirst({ where: { name: "Farmácia" } });
//     const serviceAnestesiologia = await prisma.service.findFirst({ where: { name: "Anestesiologia" } });
//     const serviceUrgenciasAdultos = await prisma.service.findFirst({ where: { name: "Urgências de Adultos" } });
//     const serviceUnidadeCuidadosIntensivos = await prisma.service.findFirst({ where: { name: "Unidade de Cuidados Intensivos" } });
//     const serviceUnidadeGenetica = await prisma.service.findFirst({ where: { name: "Unidade de Genética" } });

//     // Seed Sectors under Services/Departments
//     const sectorsData = [
//         { name: "Hidroterapia", department_id: deptMedicinaFisicaReabilitacao.id },
//         { name: "Electroterapia", department_id: deptMedicinaFisicaReabilitacao.id },
//         { name: "Centro Cirúrgico", department_id: deptCirurgia.id },
//         { name: "Urgência de Adultos", department_id: deptMedicina.id },
//         { name: "Bioquímica", department_id: deptLaboratorio.id },
//     ];
//     await prisma.sector.createMany({ data: sectorsData });

//     // Seed Repartitions under Departments
//     const repartitionsData = [
//         { name: "Tesouraria", department_id: deptFinanceiro.id },
//         { name: "Legalidade", department_id: deptFinanceiro.id },
//         { name: "Contabilidade", department_id: deptFinanceiro.id },
//         { name: "Atendimento a Empresas", department_id: deptFinanceiro.id },
//         { name: "Direcção do DF", department_id: deptFinanceiro.id },
//         { name: "Gestão Orçamental", department_id: deptFinanceiro.id },
//         { name: "Relações Públicas", department_id: deptRecursosHumanos.id },
//         { name: "Secretaria RH", department_id: deptRecursosHumanos.id },
//         { name: "Direcção dos RH", department_id: deptRecursosHumanos.id },
//         { name: "Sala de Operações", department_id: deptCirurgia.id },
//         { name: "Sala UCI", department_id: deptMedicina.id },
//         { name: "Farmácia Central", department_id: deptFarmacia.id },
//     ];
//     await prisma.repartition.createMany({ data: repartitionsData });

//     // Seed Users
//     const nelio = await prisma.user.create({
//         data: {
//             email: "nelio.bila@hcm.gov.mz",
//             password: await hash("inatounico", 10),
//             name: "Nélio Bila",
//         },
//     });

//     const luciano = await prisma.user.create({
//         data: {
//             email: "luciano.aguiar@hcm.gov.mz",
//             password: await hash("password", 10),
//             name: "Luciano Aguiar",
//         },
//     });

//     const stela = await prisma.user.create({
//         data: {
//             email: "stela.davane@hcm.gov.mz",
//             password: await hash("password", 10),
//             name: "Stela Davane",
//         },
//     });

//     const carolina = await prisma.user.create({
//         data: {
//             email: "carolina.sumbana@hcm.gov.mz",
//             password: await hash("password", 10),
//             name: "Carolina Sumbana",
//         },
//     });

//     // Seed Base Groups
//     const groupAdmins = await prisma.group.create({
//         data: {
//             name: "Admins",
//             description: "Administradores com acesso total ao sistema",
//         },
//     });

//     // Seed Groups based on Directions, Departments, Services, Sectors, and Repartitions with unique names
//     const allDirections = await prisma.direction.findMany();
//     const allDepartments = await prisma.department.findMany();
//     const allServices = await prisma.service.findMany();
//     const allSectors = await prisma.sector.findMany();
//     const allRepartitions = await prisma.repartition.findMany();

//     await prisma.group.createMany({
//         data: [
//             ...allDirections.map(direction => ({
//                 name: `Direction: ${direction.name}`,
//                 description: `Grupo para membros da Direção ${direction.name}`,
//             })),
//             ...allDepartments.map(department => ({
//                 name: `Department: ${department.name}`,
//                 description: `Grupo para membros do Departamento ${department.name}`,
//             })),
//             ...allServices.map(service => ({
//                 name: `Service: ${service.name}`,
//                 description: `Grupo para membros do Serviço ${service.name}`,
//             })),
//             ...allSectors.map(sector => ({
//                 name: `Sector: ${sector.name}`,
//                 description: `Grupo para membros do Setor ${sector.name}`,
//             })),
//             ...allRepartitions.map(repartition => ({
//                 name: `Repartition: ${repartition.name}`,
//                 description: `Grupo para membros da Repartição ${repartition.name}`,
//             })),
//         ],
//         skipDuplicates: true,
//     });

//     // Fetch the "Department: Tecnologias de Informação" group (Technicians)
//     const groupTechnicians = await prisma.group.findFirst({ where: { name: "Department: Tecnologias de Informação" } });

//     // Connect Users to Groups
//     // await prisma.userGroup.createMany({
//     //     data: [
//     //         { user_id: nelio.id, group_id: groupAdmins.id },
//     //         { user_id: stela.id, group_id: groupAdmins.id },
//     //         { user_id: luciano.id, group_id: groupTechnicians.id }, // Luciano in Technicians
//     //         { user_id: carolina.id, group_id: groupTechnicians.id }, // Carolina in Technicians
//     //     ],
//     // });

//     // Seed Permissions
//     await prisma.permission.createMany({
//         data: [
//             // User CRUD (Admins only)
//             { name: "user:read", description: "Permissão para visualizar usuários" },
//             { name: "user:create", description: "Permissão para criar usuários" },
//             { name: "user:update", description: "Permissão para atualizar usuários" },
//             { name: "user:delete", description: "Permissão para excluir usuários" },

//             // Group CRUD (Admins only)
//             { name: "group:read", description: "Permissão para visualizar grupos" },
//             { name: "group:create", description: "Permissão para criar grupos" },
//             { name: "group:update", description: "Permissão para atualizar grupos" },
//             { name: "group:delete", description: "Permissão para excluir grupos" },

//             // Permission CRUD (Admins only)
//             { name: "permission:read", description: "Permissão para visualizar permissões" },
//             { name: "permission:create", description: "Permissão para criar permissões" },
//             { name: "permission:update", description: "Permissão para atualizar permissões" },
//             { name: "permission:delete", description: "Permissão para excluir permissões" },

//             // Request Permissions
//             { name: "request:read", description: "Permissão para visualizar todas as requisições (Admins)" },
//             { name: "request:create", description: "Permissão para criar requisições (Todos)" },
//             { name: "request:update", description: "Permissão para atualizar requisições (Admins)" },
//             { name: "request:delete", description: "Permissão para excluir requisições (Admins)" },
//             { name: "request:owner:read", description: "Permissão para visualizar próprias requisições emitidas" },
//             { name: "request:owner:update", description: "Permissão para atualizar próprias requisições emitidas" },
//             { name: "request:owner:delete", description: "Permissão para excluir próprias requisições emitidas" },
//             { name: "request:destination:read", description: "Permissão para visualizar requisições recebidas" },
//             { name: "request:approve", description: "Permissão para aprovar requisições (Admins)" },

//             // Equipment Permissions (Admins and Tecnologias de Informação only)
//             { name: "equipment:read", description: "Permissão para visualizar equipamentos" },
//             { name: "equipment:create", description: "Permissão para criar equipamentos" },
//             { name: "equipment:update", description: "Permissão para atualizar equipamentos" },
//             { name: "equipment:delete", description: "Permissão para excluir equipamentos" },
//         ],
//     });

//     // Fetch all created permissions and groups
//     const allPermissions = await prisma.permission.findMany();
//     const allGroups = await prisma.group.findMany();

//     // Seed Group-Permission Relationships
//     const groupPermissions = allPermissions.flatMap(permission => {
//         const assignments = [];

//         // Admins get all permissions
//         assignments.push({ group_id: groupAdmins.id, permission_id: permission.id });

//         // Department: Tecnologias de Informação (Technicians) gets full equipment access
//         if (permission.name.startsWith("equipment:")) {
//             assignments.push({ group_id: groupTechnicians.id, permission_id: permission.id });
//         }

//         // All groups get request:create and request:owner:* permissions
//         if (
//             permission.name === "request:create" ||
//             permission.name.startsWith("request:owner:")
//         ) {
//             allGroups
//                 .filter(g => g.name !== "Admins") // Exclude Admins since they already have all permissions
//                 .forEach(g => assignments.push({ group_id: g.id, permission_id: permission.id }));
//         }

//         // All groups get request:destination:read for requests they receive
//         if (permission.name === "request:destination:read") {
//             allGroups
//                 .filter(g => g.name !== "Admins") // Exclude Admins since they already have all permissions
//                 .forEach(g => assignments.push({ group_id: g.id, permission_id: permission.id }));
//         }

//         return assignments;
//     });

//     await prisma.groupPermission.createMany({
//         data: groupPermissions,
//         skipDuplicates: true,
//     });


//     console.log("Seeder concluído com sucesso!");
// }

// main()
//     .catch((e) => {
//         console.error("Erro ao executar o seeder:", e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });




// prisma/seed.js
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Seed Directions (Check existence before creating)
    const directionsData = [
        { name: "Geral" },
        { name: "Clínica" },
        { name: "Administrativa" },
        { name: "Enfermagem" },
        { name: "Científica e Pedagógica" },
    ];

    for (const direction of directionsData) {
        const existingDirection = await prisma.direction.findFirst({
            where: { name: direction.name },
        });
        if (!existingDirection) {
            await prisma.direction.create({
                data: direction,
            });
        }
    }

    // Fetch Directions with null handling
    const directionGeral = await prisma.direction.findFirst({ where: { name: "Geral" } });
    const directionClinica = await prisma.direction.findFirst({ where: { name: "Clínica" } });
    const directionAdministrativa = await prisma.direction.findFirst({ where: { name: "Administrativa" } });
    const directionEnfermagem = await prisma.direction.findFirst({ where: { name: "Enfermagem" } });
    const directionCientificaPedagogica = await prisma.direction.findFirst({ where: { name: "Científica e Pedagógica" } });

    if (!directionClinica || !directionAdministrativa) {
        throw new Error("Required directions (Clínica or Administrativa) not found.");
    }

    // Seed Departments under Direção Clínica
    const departmentsClinicaData = [
        { name: "Cirurgia", direction_id: directionClinica.id },
        { name: "Medicina", direction_id: directionClinica.id },
        { name: "Pediatria", direction_id: directionClinica.id },
        { name: "Ortopedia", direction_id: directionClinica.id },
        { name: "Ginecologia e Obstetrícia", direction_id: directionClinica.id },
        { name: "Medicina Física e Reabilitação", direction_id: directionClinica.id },
        { name: "Clínica Especial", direction_id: directionClinica.id },
        { name: "Oncologia", direction_id: directionClinica.id },
        { name: "Laboratório Clínico", direction_id: directionClinica.id },
        { name: "Anatomia Patológica", direction_id: directionClinica.id },
        { name: "Farmácia", direction_id: directionClinica.id },
    ];

    for (const dept of departmentsClinicaData) {
        const existingDept = await prisma.department.findFirst({
            where: { name: dept.name, direction_id: dept.direction_id },
        });
        if (!existingDept) {
            await prisma.department.create({
                data: dept,
            });
        }
    }

    // Seed Departments under Direção Administrativa
    const departmentsAdministrativaData = [
        { name: "Controle Interno", direction_id: directionAdministrativa.id },
        { name: "Planejamento e Estatística", direction_id: directionAdministrativa.id },
        { name: "Recursos Humanos", direction_id: directionAdministrativa.id },
        { name: "Financeiro", direction_id: directionAdministrativa.id },
        { name: "UGEIA", direction_id: directionAdministrativa.id },
        { name: "Património", direction_id: directionAdministrativa.id },
        { name: "Manutenção Hospitalar", direction_id: directionAdministrativa.id },
        { name: "Tecnologias de Informação", direction_id: directionAdministrativa.id },
    ];

    for (const dept of departmentsAdministrativaData) {
        const existingDept = await prisma.department.findFirst({
            where: { name: dept.name, direction_id: dept.direction_id },
        });
        if (!existingDept) {
            await prisma.department.create({
                data: dept,
            });
        }
    }

    // Fetch Departments with null checks
    const deptCirurgia = await prisma.department.findFirst({ where: { name: "Cirurgia" } });
    const deptMedicina = await prisma.department.findFirst({ where: { name: "Medicina" } });
    const deptPediatria = await prisma.department.findFirst({ where: { name: "Pediatria" } });
    const deptOrtopedia = await prisma.department.findFirst({ where: { name: "Ortopedia" } });
    const deptGinecologiaObstetricia = await prisma.department.findFirst({ where: { name: "Ginecologia e Obstetrícia" } });
    const deptMedicinaFisicaReabilitacao = await prisma.department.findFirst({ where: { name: "Medicina Física e Reabilitação" } });
    const deptClinicaEspecial = await prisma.department.findFirst({ where: { name: "Clínica Especial" } });
    const deptOncologia = await prisma.department.findFirst({ where: { name: "Oncologia" } });
    const deptLaboratorio = await prisma.department.findFirst({ where: { name: "Laboratório Clínico" } });
    const deptAnatomiaPatologica = await prisma.department.findFirst({ where: { name: "Anatomia Patológica" } });
    const deptFarmacia = await prisma.department.findFirst({ where: { name: "Farmácia" } });
    const deptControleInterno = await prisma.department.findFirst({ where: { name: "Controle Interno" } });
    const deptPlanejamentoEstastistica = await prisma.department.findFirst({ where: { name: "Planejamento e Estatística" } });
    const deptRecursosHumanos = await prisma.department.findFirst({ where: { name: "Recursos Humanos" } });
    const deptFinanceiro = await prisma.department.findFirst({ where: { name: "Financeiro" } });
    const deptUGEIA = await prisma.department.findFirst({ where: { name: "UGEIA" } });
    const deptPatrimonio = await prisma.department.findFirst({ where: { name: "Património" } });
    const deptManutencaoHospitalar = await prisma.department.findFirst({ where: { name: "Manutenção Hospitalar" } });
    const deptTecnologiasInformacao = await prisma.department.findFirst({ where: { name: "Tecnologias de Informação" } });

    if (!deptMedicina || !deptLaboratorio || !deptAnatomiaPatologica || !deptCirurgia || !deptFarmacia || !deptMedicinaFisicaReabilitacao) {
        throw new Error("Required departments not found.");
    }

    // Seed Services under Direção Administrativa
    const servicesAdministrativaData = [
        { name: "Alimentação, Nutrição e Dietética", direction_id: directionAdministrativa.id },
        { name: "Lavandaria Hospitalar", direction_id: directionAdministrativa.id },
        { name: "Apoio Geral", direction_id: directionAdministrativa.id },
        { name: "Segurança Interna", direction_id: directionAdministrativa.id },
        { name: "Relações Públicas", direction_id: directionAdministrativa.id },
        { name: "Acesso Social", direction_id: directionAdministrativa.id },
        { name: "Administração dos Departamentos Clínicos", direction_id: directionAdministrativa.id },
        { name: "Administração do Departamento de Pediatria", direction_id: directionAdministrativa.id },
        { name: "Administração do Departamento de Medicina", direction_id: directionAdministrativa.id },
        { name: "Administração do Departamento de Cirurgia", direction_id: directionAdministrativa.id },
        { name: "Administração do Departamento de Ortopedia", direction_id: directionAdministrativa.id },
        { name: "Administração do Departamento de Ginecologia e Obstetrícia", direction_id: directionAdministrativa.id },
    ];

    for (const service of servicesAdministrativaData) {
        const existingService = await prisma.service.findFirst({
            where: { name: service.name, direction_id: service.direction_id },
        });
        if (!existingService) {
            await prisma.service.create({
                data: service,
            });
        }
    }

    // Seed Services under Direção Clínica
    const servicesClinicaData = [
        { name: "Banco de Sangue", department_id: deptMedicina.id },
        { name: "Laboratório de Análises Clínicas", department_id: deptLaboratorio.id },
        { name: "Anatomia Patológica", department_id: deptAnatomiaPatologica.id },
        { name: "Medicina Legal", department_id: deptMedicina.id },
        { name: "Bloco Operatório", department_id: deptCirurgia.id },
        { name: "Radiologia e Imagiologia", department_id: deptMedicina.id },
        { name: "Farmácia", department_id: deptFarmacia.id },
        { name: "Anestesiologia", department_id: deptMedicina.id },
        { name: "Urgências de Adultos", department_id: deptMedicina.id },
        { name: "Unidade de Cuidados Intensivos", department_id: deptMedicina.id },
        { name: "Unidade de Genética", department_id: deptMedicina.id },
    ];

    for (const service of servicesClinicaData) {
        const existingService = await prisma.service.findFirst({
            where: { name: service.name, department_id: service.department_id },
        });
        if (!existingService) {
            await prisma.service.create({
                data: service,
            });
        }
    }

    // Fetch Services
    const serviceBancoSangue = await prisma.service.findFirst({ where: { name: "Banco de Sangue" } });
    const serviceLabAnalisesClinicas = await prisma.service.findFirst({ where: { name: "Laboratório de Análises Clínicas" } });
    const serviceAnatomiaPatologica = await prisma.service.findFirst({ where: { name: "Anatomia Patológica" } });
    const serviceMedicinaLegal = await prisma.service.findFirst({ where: { name: "Medicina Legal" } });
    const serviceBlocoOperatorio = await prisma.service.findFirst({ where: { name: "Bloco Operatório" } });
    const serviceRadiologiaImagem = await prisma.service.findFirst({ where: { name: "Radiologia e Imagiologia" } });
    const serviceFarmarcia = await prisma.service.findFirst({ where: { name: "Farmácia" } });
    const serviceAnestesiologia = await prisma.service.findFirst({ where: { name: "Anestesiologia" } });
    const serviceUrgenciasAdultos = await prisma.service.findFirst({ where: { name: "Urgências de Adultos" } });
    const serviceUnidadeCuidadosIntensivos = await prisma.service.findFirst({ where: { name: "Unidade de Cuidados Intensivos" } });
    const serviceUnidadeGenetica = await prisma.service.findFirst({ where: { name: "Unidade de Genética" } });

    // Seed Sectors
    const sectorsData = [
        { name: "Hidroterapia", department_id: deptMedicinaFisicaReabilitacao.id },
        { name: "Electroterapia", department_id: deptMedicinaFisicaReabilitacao.id },
        { name: "Centro Cirúrgico", department_id: deptCirurgia.id },
        { name: "Urgência de Adultos", department_id: deptMedicina.id },
        { name: "Bioquímica", department_id: deptLaboratorio.id },
    ];

    for (const sector of sectorsData) {
        const existingSector = await prisma.sector.findFirst({
            where: { name: sector.name, department_id: sector.department_id },
        });
        if (!existingSector) {
            await prisma.sector.create({
                data: sector,
            });
        }
    }

    // Seed Repartitions
    const repartitionsData = [
        { name: "Tesouraria", department_id: deptFinanceiro.id },
        { name: "Legalidade", department_id: deptFinanceiro.id },
        { name: "Contabilidade", department_id: deptFinanceiro.id },
        { name: "Atendimento a Empresas", department_id: deptFinanceiro.id },
        { name: "Direcção do DF", department_id: deptFinanceiro.id },
        { name: "Gestão Orçamental", department_id: deptFinanceiro.id },
        { name: "Relações Públicas", department_id: deptRecursosHumanos.id },
        { name: "Secretaria RH", department_id: deptRecursosHumanos.id },
        { name: "Direcção dos RH", department_id: deptRecursosHumanos.id },
        { name: "Sala de Operações", department_id: deptCirurgia.id },
        { name: "Sala UCI", department_id: deptMedicina.id },
        { name: "Farmácia Central", department_id: deptFarmacia.id },
    ];

    for (const repartition of repartitionsData) {
        const existingRepartition = await prisma.repartition.findFirst({
            where: { name: repartition.name, department_id: repartition.department_id },
        });
        if (!existingRepartition) {
            await prisma.repartition.create({
                data: repartition,
            });
        }
    }

    // Seed Users
    const usersData = [
        { email: "nelio.bila@hcm.gov.mz", password: await hash("inatounico", 10), name: "Nélio Bila" },
        { email: "luciano.aguiar@hcm.gov.mz", password: await hash("password", 10), name: "Luciano Aguiar" },
        { email: "stela.davane@hcm.gov.mz", password: await hash("password", 10), name: "Stela Davane" },
        { email: "carolina.sumbana@hcm.gov.mz", password: await hash("password", 10), name: "Carolina Sumbana" },
    ];

    for (const user of usersData) {
        const existingUser = await prisma.user.findFirst({
            where: { email: user.email },
        });
        if (!existingUser) {
            await prisma.user.create({
                data: user,
            });
        }
    }

    const nelio = await prisma.user.findFirst({ where: { email: "nelio.bila@hcm.gov.mz" } });
    const luciano = await prisma.user.findFirst({ where: { email: "luciano.aguiar@hcm.gov.mz" } });
    const stela = await prisma.user.findFirst({ where: { email: "stela.davane@hcm.gov.mz" } });
    const carolina = await prisma.user.findFirst({ where: { email: "carolina.sumbana@hcm.gov.mz" } });

    if (!nelio || !luciano || !stela || !carolina) {
        throw new Error("Required users not found.");
    }

    // Seed Groups
    const existingAdminGroup = await prisma.group.findFirst({ where: { name: "Admins" } });
    if (!existingAdminGroup) {
        await prisma.group.create({
            data: {
                name: "Admins",
                description: "Administradores com acesso total ao sistema",
            },
        });
    }

    const allDirections = await prisma.direction.findMany();
    const allDepartments = await prisma.department.findMany();
    const allServices = await prisma.service.findMany();
    const allSectors = await prisma.sector.findMany();
    const allRepartitions = await prisma.repartition.findMany();

    const groupData = [
        ...allDirections.map(direction => ({
            name: `Direction: ${direction.name}`,
            description: `Grupo para membros da Direção ${direction.name}`,
        })),
        ...allDepartments.map(department => ({
            name: `Department: ${department.name}`,
            description: `Grupo para membros do Departamento ${department.name}`,
        })),
        ...allServices.map(service => ({
            name: `Service: ${service.name}`,
            description: `Grupo para membros do Serviço ${service.name}`,
        })),
        ...allSectors.map(sector => ({
            name: `Sector: ${sector.name}`,
            description: `Grupo para membros do Setor ${sector.name}`,
        })),
        ...allRepartitions.map(repartition => ({
            name: `Repartition: ${repartition.name}`,
            description: `Grupo para membros da Repartição ${repartition.name}`,
        })),
    ];

    for (const group of groupData) {
        const existingGroup = await prisma.group.findFirst({
            where: { name: group.name },
        });
        if (!existingGroup) {
            await prisma.group.create({
                data: group,
            });
        }
    }

    const groupAdmins = await prisma.group.findFirst({ where: { name: "Admins" } });
    const groupTechnicians = await prisma.group.findFirst({ where: { name: "Department: Tecnologias de Informação" } });

    if (!groupAdmins || !groupTechnicians) {
        throw new Error("Required groups (Admins or Technicians) not found.");
    }

    // Seed Permissions
    const permissionsData = [
        { name: "user:read", description: "Permissão para visualizar usuários" },
        { name: "user:create", description: "Permissão para criar usuários" },
        { name: "user:update", description: "Permissão para atualizar usuários" },
        { name: "user:delete", description: "Permissão para excluir usuários" },
        { name: "group:read", description: "Permissão para visualizar grupos" },
        { name: "group:create", description: "Permissão para criar grupos" },
        { name: "group:update", description: "Permissão para atualizar grupos" },
        { name: "group:delete", description: "Permissão para excluir grupos" },
        { name: "permission:read", description: "Permissão para visualizar permissões" },
        { name: "permission:create", description: "Permissão para criar permissões" },
        { name: "permission:update", description: "Permissão para atualizar permissões" },
        { name: "permission:delete", description: "Permissão para excluir permissões" },
        { name: "request:read", description: "Permissão para visualizar todas as requisições (Admins)" },
        { name: "request:create", description: "Permissão para criar requisições (Todos)" },
        { name: "request:update", description: "Permissão para atualizar requisições (Admins)" },
        { name: "request:delete", description: "Permissão para excluir requisições (Admins)" },
        { name: "request:owner:read", description: "Permissão para visualizar próprias requisições emitidas" },
        { name: "request:owner:update", description: "Permissão para atualizar próprias requisições emitidas" },
        { name: "request:owner:delete", description: "Permissão para excluir próprias requisições emitidas" },
        { name: "request:destination:read", description: "Permissão para visualizar requisições recebidas" },
        { name: "request:approve", description: "Permissão para aprovar requisições (Admins)" },
        { name: "equipment:read", description: "Permissão para visualizar equipamentos" },
        { name: "equipment:create", description: "Permissão para criar equipamentos" },
        { name: "equipment:update", description: "Permissão para atualizar equipamentos" },
        { name: "equipment:delete", description: "Permissão para excluir equipamentos" },
    ];

    for (const perm of permissionsData) {
        const existingPerm = await prisma.permission.findFirst({
            where: { name: perm.name },
        });
        if (!existingPerm) {
            await prisma.permission.create({
                data: perm,
            });
        }
    }

    // Fetch all groups and permissions
    const allPermissions = await prisma.permission.findMany();
    const allGroups = await prisma.group.findMany();

    // Seed Group-Permission Relationships
    const groupPermissions = allPermissions.flatMap(permission => {
        const assignments = [];
        assignments.push({ group_id: groupAdmins.id, permission_id: permission.id });

        if (permission.name.startsWith("equipment:")) {
            assignments.push({ group_id: groupTechnicians.id, permission_id: permission.id });
        }

        if (
            permission.name === "request:create" ||
            permission.name.startsWith("request:owner:") ||
            permission.name === "request:destination:read"
        ) {
            allGroups
                .filter(g => g.name !== "Admins")
                .forEach(g => assignments.push({ group_id: g.id, permission_id: permission.id }));
        }

        return assignments;
    });

    await prisma.groupPermission.createMany({
        data: groupPermissions,
        skipDuplicates: true,
    });

    // Seed User-Group Relationships
    const userGroupData = [
        { user_id: nelio.id, group_id: groupAdmins.id },
        { user_id: stela.id, group_id: groupAdmins.id },
        { user_id: luciano.id, group_id: groupTechnicians.id },
        { user_id: carolina.id, group_id: groupTechnicians.id },
    ];

    for (const ug of userGroupData) {
        const existingUserGroup = await prisma.userGroup.findFirst({
            where: { user_id: ug.user_id, group_id: ug.group_id },
        });
        if (!existingUserGroup) {
            await prisma.userGroup.create({
                data: ug,
            });
        }
    }

    console.log("Seeder concluído com sucesso sem apagar dados existentes!");
}

main()
    .catch((e) => {
        console.error("Erro ao executar o seeder:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });