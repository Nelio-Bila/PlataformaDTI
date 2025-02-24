import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // Delete all existing data to replace everything
    await prisma.userGroup.deleteMany({});
    await prisma.groupPermission.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.group.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.repartition.deleteMany({});
    await prisma.sector.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.direction.deleteMany({});

    // Seed Directions (Direções)
    const directionGeral = await prisma.direction.create({ data: { name: "Geral", }, });
    const directionClinica = await prisma.direction.create({ data: { name: "Clínica", }, });
    const directionAdmin = await prisma.direction.create({ data: { name: "Administrativa", }, });
    const directionCientificaPedagogica = await prisma.direction.create({ data: { name: "Científica e Pedagógica", }, });
    const directionEnfermagem = await prisma.direction.create({ data: { name: "Enfermagem", }, });

    // Seed Departments (Departamentos)
    // Departamentos da Direcção Clinica
    const deptCirurgia = await prisma.department.create({ data: { name: "Cirurgia", direction_id: directionClinica.id, }, });
    const deptMedicina = await prisma.department.create({ data: { name: "Medicina", direction_id: directionClinica.id, }, }); // Corrected "Medicinas" to "Medicina"
    const deptLabClinico = await prisma.department.create({ data: { name: "Laboratório", direction_id: directionClinica.id, }, });
    const deptAnatomiaPatologica = await prisma.department.create({ data: { name: "Anatomia Patológica", direction_id: directionClinica.id, }, });
    const deptFarmacia = await prisma.department.create({ data: { name: "Farmácia", direction_id: directionClinica.id, }, });
    const deptPediatria = await prisma.department.create({ data: { name: "Pediatria", direction_id: directionClinica.id, }, });
    const deptOncologia = await prisma.department.create({ data: { name: "Oncologia", direction_id: directionClinica.id, }, });
    const deptMFR = await prisma.department.create({ data: { name: "Medicina Física e Reabilitação", direction_id: directionClinica.id, }, });

    // Departamentos da Direcção Administrativa
    const deptRH = await prisma.department.create({ data: { name: "Recursos Humanos", direction_id: directionAdmin.id, }, });
    const deptFinanceiro = await prisma.department.create({ data: { name: "Financeiro", direction_id: directionAdmin.id, }, });
    const deptUGEIA = await prisma.department.create({ data: { name: "UGEIA", direction_id: directionAdmin.id, }, });
    const deptPatrimonio = await prisma.department.create({ data: { name: "Património", direction_id: directionAdmin.id, }, });
    const deptDTI = await prisma.department.create({ data: { name: "Tecnologias de Informação", direction_id: directionAdmin.id, }, });

    // Seed Services (Serviços)
    const serviceManutencao = await prisma.service.create({ data: { name: "Manutenção Hospitalar", direction_id: directionAdmin.id, }, });
    const serviceCuidadosIntensivos = await prisma.service.create({ data: { name: "Unidade de Cuidados Intensivos", department_id: deptMedicina.id, }, });
    const serviceDistribuicao = await prisma.service.create({ data: { name: "Depósito de Medicamentos", department_id: deptFarmacia.id, }, }); // Corrected typo "Depoosito"
    const serviceOrtoprotesia = await prisma.service.create({ data: { name: "Ortoprotesia", department_id: deptMFR.id, }, });
    const serviceFisioterapia = await prisma.service.create({ data: { name: "Fisioterapia", department_id: deptMFR.id, }, });
    const serviceTerapiaDeFala = await prisma.service.create({ data: { name: "Terapia de Fala", department_id: deptMFR.id, }, }); // Corrected typo "Terapai"
    const serviceAcupuntura = await prisma.service.create({ data: { name: "Acupuntura", department_id: deptMFR.id, }, }); // Corrected typo "Acumpuctura"
    const serviceUrologia = await prisma.service.create({ data: { name: "Urologia", department_id: deptMFR.id, }, });

    // Seed Sectors (Setores)
    const sectorProteses = await prisma.sector.create({ data: { name: "Próteses", department_id: deptMFR.id, }, });
    const sectorOrtoteses = await prisma.sector.create({ data: { name: "Ortoteses", department_id: deptMFR.id, }, });
    const sectorHidroterapia = await prisma.sector.create({ data: { name: "Hidroterapia", department_id: deptMFR.id, }, });
    const sectorElectroterapia = await prisma.sector.create({ data: { name: "Electroterapia", department_id: deptMFR.id, }, });
    const sectorCentroCirurgico = await prisma.sector.create({ data: { name: "Centro Cirúrgico", department_id: deptCirurgia.id, }, });
    const sectorUrgencia = await prisma.sector.create({ data: { name: "Urgência de Adultos", department_id: deptMedicina.id, }, });
    const sectorBioquimica = await prisma.sector.create({ data: { name: "Bioquímica", department_id: deptLabClinico.id, }, });

    // Seed Repartitions (Repartições)
    const reparticaoTesouraria = await prisma.repartition.create({ data: { name: "Tesouraria", department_id: deptFinanceiro.id, }, });
    const reparticaoLegalidade = await prisma.repartition.create({ data: { name: "Legalidade", department_id: deptFinanceiro.id, }, });
    const reparticaoContabilidade = await prisma.repartition.create({ data: { name: "Contabilidade", department_id: deptFinanceiro.id, }, });
    const reparticaoAtendimentoAEmpresas = await prisma.repartition.create({ data: { name: "Atendimento a Empresas", department_id: deptFinanceiro.id, }, });
    const reparticaoDireccaoDF = await prisma.repartition.create({ data: { name: "Direcção do DF", department_id: deptFinanceiro.id, }, });
    const reparticaoGestaoOrcamental = await prisma.repartition.create({ data: { name: "Gestão Orçamental", department_id: deptFinanceiro.id, }, });
    const reparticaoRelacoesPublicas = await prisma.repartition.create({ data: { name: "Relações Públicas", department_id: deptFinanceiro.id, }, });
    const reparticaoSecretariaRH = await prisma.repartition.create({ data: { name: "Secretaria RH", department_id: deptFinanceiro.id, }, });
    const reparticaoDireccaoRH = await prisma.repartition.create({ data: { name: "Direcção dos RH", department_id: deptFinanceiro.id, }, });
    const reparticaoSalaOperacao1 = await prisma.repartition.create({ data: { name: "Sala de Operações", department_id: deptCirurgia.id, }, });
    const reparticaoUCI = await prisma.repartition.create({ data: { name: "Sala UCI", department_id: deptMedicina.id, }, });
    const reparticaoFarmaciaCentral = await prisma.repartition.create({ data: { name: "Farmácia Central", department_id: deptFarmacia.id, }, });

    // Seed Users (Usuários)
    const nelio = await prisma.user.create({
        data: {
            email: "nelio.bila@hcm.gov.mz",
            password: await hash("inatounico", 10),
            name: "Nélio Bila",
            groups: { create: [{ group: { create: { name: "Admins" } } }] },
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

    // Seed Permissions (Permissões)
    const permission1 = await prisma.permission.create({
        data: {
            name: "equipment:read",
            description: "Permissão para visualizar dados de equipamentos",
        },
    });

    const permission2 = await prisma.permission.create({
        data: {
            name: "equipment:write",
            description: "Permissão para editar dados de equipamentos",
        },
    });

    // Seed User-Group Relationships (Relações Usuário-Grupo)
    await prisma.userGroup.createMany({
        data: [
            { user_id: nelio.id, group_id: group1.id },
        ],
    });

    // Seed Group-Permission Relationships (Relações Grupo-Permissão)
    await prisma.groupPermission.createMany({
        data: [
            { group_id: group1.id, permission_id: permission1.id },
            { group_id: group1.id, permission_id: permission2.id },
            { group_id: group2.id, permission_id: permission1.id },
            { group_id: group2.id, permission_id: permission2.id },
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