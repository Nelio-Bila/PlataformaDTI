// seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Seed Directions (Direções)
    const directionClinica = await prisma.direction.create({
        data: {
            name: "Clínica",
        },
    });

    const directionAdmin = await prisma.direction.create({
        data: {
            name: "Administrativa",
        },
    });

    const directionCientificaPedagogica = await prisma.direction.create({
        data: {
            name: "Científica e Pedagógica",
        },
    });

    const directionEnfermagem = await prisma.direction.create({
        data: {
            name: "Científica e Pedagógica",
        },
    });

    // Seed Departments (Departamentos)
    const deptCirurgia = await prisma.department.create({
        data: {
            name: "Cirurgia",
            direction_id: directionClinica.id,
        },
    });

    const deptMedicina = await prisma.department.create({
        data: {
            name: "Medicinas",
            direction_id: directionClinica.id,
        },
    });

    const deptFarmacia = await prisma.department.create({
        data: {
            name: "Recursos Humanos",
            direction_id: directionAdmin.id,
        },
    });

    const deptLabClinico = await prisma.department.create({
        data: {
            name: "Laboratório de Análises Clínicas",
            direction_id: directionCientificaPedagogica.id,
        },
    });

    const deptAnatomiaPatologica = await prisma.department.create({
        data: {
            name: "Anatomia Patológica",
            direction_id: directionCientificaPedagogica.id,
        },
    });

    // Seed Sectors (Setores)
    const sectorCentroCirurgico = await prisma.sector.create({
        data: {
            name: "Centro Cirúrgico",
            department_id: deptCirurgia.id,
        },
    });

    const sectorUrgencia = await prisma.sector.create({
        data: {
            name: "Urgência de Adultos",
            department_id: deptMedicina.id,
        },
    });

    const sectorBioquimica = await prisma.sector.create({
        data: {
            name: "Bioquímica",
            department_id: deptLabClinico.id,
        },
    });

    // Seed Services (Serviços)
    const serviceManutencao = await prisma.service.create({
        data: {
            name: "Manutenção de Equipamentos",
            department_id: deptCirurgia.id,
        },
    });

    const serviceCuidadosIntensivos = await prisma.service.create({
        data: {
            name: "Unidade de Cuidados Intensivos",
            department_id: deptMedicina.id,
        },
    });

    const serviceDistribuicao = await prisma.service.create({
        data: {
            name: "Depoosito de Medicamentos",
            department_id: deptFarmacia.id,
        },
    });

    // Seed Repartitions (Repartições)
    const reparticaoSalaOperacao1 = await prisma.repartition.create({
        data: {
            name: "Sala de Operações",
            department_id: deptCirurgia.id,
        },
    });

    const reparticaoUCI = await prisma.repartition.create({
        data: {
            name: "Sala UCI",
            department_id: deptMedicina.id,
        },
    });

    const reparticaoFarmaciaCentral = await prisma.repartition.create({
        data: {
            name: "Farmácia Central",
            department_id: deptFarmacia.id,
        },
    });

    // Seed Equipment (Equipamentos)
    const equipment1 = await prisma.equipment.create({
        data: {
            serial_number: "EQP-HOSP-001",
            type: "Monitoramento",
            brand: "Philips",
            model: "MX800",
            purchase_date: new Date("2022-06-10"),
            warranty_end: new Date("2024-06-10"),
            status: "ATIVO",
            direction_id: directionClinica.id,
            department_id: deptCirurgia.id,
            sector_id: sectorCentroCirurgico.id,
            service_id: serviceManutencao.id,
            repartition_id: reparticaoSalaOperacao1.id,
        },
    });

    const equipment2 = await prisma.equipment.create({
        data: {
            serial_number: "EQP-HOSP-002",
            type: "Anestesia",
            brand: "Dräger",
            model: "Fabius Plus",
            purchase_date: new Date("2023-03-15"),
            warranty_end: new Date("2025-03-15"),
            status: "MANUTENÇÃO",
            direction_id: directionClinica.id,
            department_id: deptCirurgia.id,
            sector_id: sectorCentroCirurgico.id,
            service_id: serviceManutencao.id,
            repartition_id: reparticaoSalaOperacao1.id,
        },
    });

    const equipment3 = await prisma.equipment.create({
        data: {
            serial_number: "EQP-HOSP-003",
            type: "Diagnóstico",
            brand: "Roche",
            model: "Cobas 6000",
            purchase_date: new Date("2021-01-20"),
            warranty_end: new Date("2023-01-20"),
            status: "ATIVO",
            direction_id: directionCientificaPedagogica.id,
            department_id: deptLabClinico.id,
            sector_id: sectorBioquimica.id,
            service_id: null,
            repartition_id: null,
        },
    });

    // Seed Users (Usuários)
    const nelio = await prisma.user.create({
        data: {
            email: "nelio.bila@hcm.gov.mz",
            password: await hash("password123", 10),
            name: "Nélio Bila",
            groups: { create: [{ group: { create: { name: "Admins" } } }] },
        },
    });

    const user1 = await prisma.user.create({
        data: {
            name: "Dr. João Silva",
            email: "joao.silva@hospital.com",
            emailVerified: new Date(),
            password: await hash("senhaSegura123", 10),
            image: "https://example.com/joao.jpg",
        },
    });

    const user2 = await prisma.user.create({
        data: {
            name: "Ana Costa",
            email: "ana.costa@hospital.com",
            emailVerified: new Date(),
            password: await hash("senhaSegura456", 10),
            image: "https://example.com/ana.jpg",
        },
    });

    // Seed Groups (Grupos)
    const group1 = await prisma.group.create({
        data: {
            name: "Administradores",
            description: "Administradores com acesso total ao sistema",
        },
    });

    const group2 = await prisma.group.create({
        data: {
            name: "Técnicos",
            description: "Equipe técnica responsável por manutenção",
        },
    });

    const group3 = await prisma.group.create({
        data: {
            name: "Médicos",
            description: "Profissionais de saúde com acesso a equipamentos",
        },
    });

    // Seed Permissions (Permissões)
    const permission1 = await prisma.permission.create({
        data: {
            name: "equipamento:leitura",
            description: "Permissão para visualizar dados de equipamentos",
        },
    });

    const permission2 = await prisma.permission.create({
        data: {
            name: "equipamento:escrita",
            description: "Permissão para editar dados de equipamentos",
        },
    });

    const permission3 = await prisma.permission.create({
        data: {
            name: "paciente:leitura",
            description: "Permissão para visualizar dados de pacientes",
        },
    });

    // Seed User-Group Relationships (Relações Usuário-Grupo)
    await prisma.userGroup.createMany({
        data: [
            { user_id: nelio.id, group_id: group1.id }, // Nélio é Admin
            { user_id: user1.id, group_id: group1.id }, // João é Admin
            { user_id: user1.id, group_id: group3.id }, // João também é Médico
            { user_id: user2.id, group_id: group2.id }, // Ana é Técnica
        ],
    });

    // Seed Group-Permission Relationships (Relações Grupo-Permissão)
    await prisma.groupPermission.createMany({
        data: [
            { group_id: group1.id, permission_id: permission1.id },
            { group_id: group1.id, permission_id: permission2.id },
            { group_id: group1.id, permission_id: permission3.id },
            { group_id: group2.id, permission_id: permission1.id },
            { group_id: group2.id, permission_id: permission2.id },
            { group_id: group3.id, permission_id: permission1.id },
            { group_id: group3.id, permission_id: permission3.id },
        ],
    });

    console.log("Seeder concluído com sucesso!");
}

main()
    .catch((e) => {
        console.error("Erro ao executar o seeder:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });