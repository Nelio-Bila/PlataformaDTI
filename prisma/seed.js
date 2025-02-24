// import { PrismaClient } from "@prisma/client";
// import { hash } from "bcryptjs";

// const prisma = new PrismaClient();

// async function main() {
//     // Delete all existing data to replace everything
//     await prisma.userGroup.deleteMany({});
//     await prisma.groupPermission.deleteMany({});
//     await prisma.permission.deleteMany({});
//     await prisma.group.deleteMany({});
//     await prisma.user.deleteMany({});
//     await prisma.repartition.deleteMany({});
//     await prisma.sector.deleteMany({});
//     await prisma.service.deleteMany({});
//     await prisma.department.deleteMany({});
//     await prisma.direction.deleteMany({});

//     // Seed Directions (Direções)
//     const directionGeral = await prisma.direction.create({ data: { name: "Geral", }, });
//     const directionClinica = await prisma.direction.create({ data: { name: "Clínica", }, });
//     const directionAdmin = await prisma.direction.create({ data: { name: "Administrativa", }, });
//     const directionCientificaPedagogica = await prisma.direction.create({ data: { name: "Científica e Pedagógica", }, });
//     const directionEnfermagem = await prisma.direction.create({ data: { name: "Enfermagem", }, });

//     // Seed Departments (Departamentos)
//     // Departamentos da Direcção Clinica
//     const deptCirurgia = await prisma.department.create({ data: { name: "Cirurgia", direction_id: directionClinica.id, }, });
//     const deptMedicina = await prisma.department.create({ data: { name: "Medicina", direction_id: directionClinica.id, }, }); // Corrected "Medicinas" to "Medicina"
//     const deptLabClinico = await prisma.department.create({ data: { name: "Laboratório", direction_id: directionClinica.id, }, });
//     const deptAnatomiaPatologica = await prisma.department.create({ data: { name: "Anatomia Patológica", direction_id: directionClinica.id, }, });
//     const deptFarmacia = await prisma.department.create({ data: { name: "Farmácia", direction_id: directionClinica.id, }, });
//     const deptPediatria = await prisma.department.create({ data: { name: "Pediatria", direction_id: directionClinica.id, }, });
//     const deptOncologia = await prisma.department.create({ data: { name: "Oncologia", direction_id: directionClinica.id, }, });
//     const deptMFR = await prisma.department.create({ data: { name: "Medicina Física e Reabilitação", direction_id: directionClinica.id, }, });

//     // Departamentos da Direcção Administrativa
//     const deptRH = await prisma.department.create({ data: { name: "Recursos Humanos", direction_id: directionAdmin.id, }, });
//     const deptFinanceiro = await prisma.department.create({ data: { name: "Financeiro", direction_id: directionAdmin.id, }, });
//     const deptUGEIA = await prisma.department.create({ data: { name: "UGEIA", direction_id: directionAdmin.id, }, });
//     const deptPatrimonio = await prisma.department.create({ data: { name: "Património", direction_id: directionAdmin.id, }, });
//     const deptDTI = await prisma.department.create({ data: { name: "Tecnologias de Informação", direction_id: directionAdmin.id, }, });

//     // Seed Services (Serviços)
//     const serviceManutencao = await prisma.service.create({ data: { name: "Manutenção Hospitalar", direction_id: directionAdmin.id, }, });
//     const serviceCuidadosIntensivos = await prisma.service.create({ data: { name: "Unidade de Cuidados Intensivos", department_id: deptMedicina.id, }, });
//     const serviceDistribuicao = await prisma.service.create({ data: { name: "Depósito de Medicamentos", department_id: deptFarmacia.id, }, }); // Corrected typo "Depoosito"
//     const serviceOrtoprotesia = await prisma.service.create({ data: { name: "Ortoprotesia", department_id: deptMFR.id, }, });
//     const serviceFisioterapia = await prisma.service.create({ data: { name: "Fisioterapia", department_id: deptMFR.id, }, });
//     const serviceTerapiaDeFala = await prisma.service.create({ data: { name: "Terapia de Fala", department_id: deptMFR.id, }, }); // Corrected typo "Terapai"
//     const serviceAcupuntura = await prisma.service.create({ data: { name: "Acupuntura", department_id: deptMFR.id, }, }); // Corrected typo "Acumpuctura"
//     const serviceUrologia = await prisma.service.create({ data: { name: "Urologia", department_id: deptMFR.id, }, });

//     // Seed Sectors (Setores)
//     const sectorProteses = await prisma.sector.create({ data: { name: "Próteses", department_id: deptMFR.id, }, });
//     const sectorOrtoteses = await prisma.sector.create({ data: { name: "Ortoteses", department_id: deptMFR.id, }, });
//     const sectorHidroterapia = await prisma.sector.create({ data: { name: "Hidroterapia", department_id: deptMFR.id, }, });
//     const sectorElectroterapia = await prisma.sector.create({ data: { name: "Electroterapia", department_id: deptMFR.id, }, });
//     const sectorCentroCirurgico = await prisma.sector.create({ data: { name: "Centro Cirúrgico", department_id: deptCirurgia.id, }, });
//     const sectorUrgencia = await prisma.sector.create({ data: { name: "Urgência de Adultos", department_id: deptMedicina.id, }, });
//     const sectorBioquimica = await prisma.sector.create({ data: { name: "Bioquímica", department_id: deptLabClinico.id, }, });

//     // Seed Repartitions (Repartições)
//     const reparticaoTesouraria = await prisma.repartition.create({ data: { name: "Tesouraria", department_id: deptFinanceiro.id, }, });
//     const reparticaoLegalidade = await prisma.repartition.create({ data: { name: "Legalidade", department_id: deptFinanceiro.id, }, });
//     const reparticaoContabilidade = await prisma.repartition.create({ data: { name: "Contabilidade", department_id: deptFinanceiro.id, }, });
//     const reparticaoAtendimentoAEmpresas = await prisma.repartition.create({ data: { name: "Atendimento a Empresas", department_id: deptFinanceiro.id, }, });
//     const reparticaoDireccaoDF = await prisma.repartition.create({ data: { name: "Direcção do DF", department_id: deptFinanceiro.id, }, });
//     const reparticaoGestaoOrcamental = await prisma.repartition.create({ data: { name: "Gestão Orçamental", department_id: deptFinanceiro.id, }, });
//     const reparticaoRelacoesPublicas = await prisma.repartition.create({ data: { name: "Relações Públicas", department_id: deptFinanceiro.id, }, });
//     const reparticaoSecretariaRH = await prisma.repartition.create({ data: { name: "Secretaria RH", department_id: deptFinanceiro.id, }, });
//     const reparticaoDireccaoRH = await prisma.repartition.create({ data: { name: "Direcção dos RH", department_id: deptFinanceiro.id, }, });
//     const reparticaoSalaOperacao1 = await prisma.repartition.create({ data: { name: "Sala de Operações", department_id: deptCirurgia.id, }, });
//     const reparticaoUCI = await prisma.repartition.create({ data: { name: "Sala UCI", department_id: deptMedicina.id, }, });
//     const reparticaoFarmaciaCentral = await prisma.repartition.create({ data: { name: "Farmácia Central", department_id: deptFarmacia.id, }, });

//     // Seed Users (Usuários)
//     const nelio = await prisma.user.create({
//         data: {
//             email: "nelio.bila@hcm.gov.mz",
//             password: await hash("inatounico", 10),
//             name: "Nélio Bila",
//             groups: { create: [{ group: { create: { name: "Admins" } } }] },
//         },
//     });

//     // Seed Groups (Grupos)
//     const group1 = await prisma.group.create({
//         data: {
//             name: "Administradores",
//             description: "Administradores com acesso total ao sistema",
//         },
//     });

//     const group2 = await prisma.group.create({
//         data: {
//             name: "Técnicos",
//             description: "Equipe técnica responsável por manutenção",
//         },
//     });

//     // Seed Permissions (Permissões)
//     const permission1 = await prisma.permission.create({
//         data: {
//             name: "equipment:read",
//             description: "Permissão para visualizar dados de equipamentos",
//         },
//     });

//     const permission2 = await prisma.permission.create({
//         data: {
//             name: "equipment:write",
//             description: "Permissão para editar dados de equipamentos",
//         },
//     });

//     // Seed User-Group Relationships (Relações Usuário-Grupo)
//     await prisma.userGroup.createMany({
//         data: [
//             { user_id: nelio.id, group_id: group1.id },
//         ],
//     });

//     // Seed Group-Permission Relationships (Relações Grupo-Permissão)
//     await prisma.groupPermission.createMany({
//         data: [
//             { group_id: group1.id, permission_id: permission1.id },
//             { group_id: group1.id, permission_id: permission2.id },
//             { group_id: group2.id, permission_id: permission1.id },
//             { group_id: group2.id, permission_id: permission2.id },
//         ],
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
    const directionAdministrativa = await prisma.direction.create({ data: { name: "Administrativa", }, });
    const directionEnfermagem = await prisma.direction.create({ data: { name: "Enfermagem", }, });
    const directionCientificaPedagogica = await prisma.direction.create({ data: { name: "Científica e Pedagógica", }, });

    // Seed Departments (Departamentos) under Direção Clínica
    const deptCirurgia = await prisma.department.create({ data: { name: "Cirurgia", direction_id: directionClinica.id, }, });
    const deptMedicina = await prisma.department.create({ data: { name: "Medicina", direction_id: directionClinica.id, }, });
    const deptPediatria = await prisma.department.create({ data: { name: "Pediatria", direction_id: directionClinica.id, }, });
    const deptOrtopedia = await prisma.department.create({ data: { name: "Ortopedia", direction_id: directionClinica.id, }, });
    const deptGinecologiaObstetricia = await prisma.department.create({ data: { name: "Ginecologia e Obstetrícia", direction_id: directionClinica.id, }, });
    const deptMedicinaFisicaReabilitacao = await prisma.department.create({ data: { name: "Medicina Física e Reabilitação", direction_id: directionClinica.id, }, });
    const deptClinicaEspecial = await prisma.department.create({ data: { name: "Clínica Especial", direction_id: directionClinica.id, }, });
    const deptOncologia = await prisma.department.create({ data: { name: "Oncologia", direction_id: directionClinica.id, }, });
    const deptLaboratorio = await prisma.department.create({ data: { name: "Laboratório Clínico", direction_id: directionClinica.id, }, });
    const deptAnatomiaPatologica = await prisma.department.create({ data: { name: "Anatomia Patológica", direction_id: directionClinica.id, }, });
    const deptFarmacia = await prisma.department.create({ data: { name: "Farmácia", direction_id: directionClinica.id, }, });

    // Seed Departments (Departamentos) under Direção Administrativa
    const deptControleInterno = await prisma.department.create({ data: { name: "Controle Interno", direction_id: directionAdministrativa.id, }, });
    const deptPlanejamentoEstastistica = await prisma.department.create({ data: { name: "Planejamento e Estatística", direction_id: directionAdministrativa.id, }, });
    const deptRecursosHumanos = await prisma.department.create({ data: { name: "Recursos Humanos", direction_id: directionAdministrativa.id, }, });
    const deptFinanceiro = await prisma.department.create({ data: { name: "Financeiro", direction_id: directionAdministrativa.id, }, });
    const deptUGEIA = await prisma.department.create({ data: { name: "UGEIA", direction_id: directionAdministrativa.id, }, });
    const deptPatrimonio = await prisma.department.create({ data: { name: "Património", direction_id: directionAdministrativa.id, }, });
    const deptManutencaoHospitalar = await prisma.department.create({ data: { name: "Manutenção Hospitalar", direction_id: directionAdministrativa.id, }, });
    const deptTecnologiasInformacao = await prisma.department.create({ data: { name: "Tecnologias de Informação", direction_id: directionAdministrativa.id, }, });

    // Seed Departments (Departamentos) under Direção de Enfermagem
    const deptEnfermagemPediatria = await prisma.department.create({ data: { name: "Enfermagem de Pediatria", direction_id: directionEnfermagem.id, }, });
    const deptEnfermagemMedicina = await prisma.department.create({ data: { name: "Enfermagem de Medicina", direction_id: directionEnfermagem.id, }, });
    const deptEnfermagemOrtopedia = await prisma.department.create({ data: { name: "Enfermagem de Ortopedia", direction_id: directionEnfermagem.id, }, });
    const deptEnfermagemGinecologiaObstetricia = await prisma.department.create({ data: { name: "Enfermagem de Ginecologia e Obstetrícia", direction_id: directionEnfermagem.id, }, });
    const deptEnfermagemClinicaEspecial = await prisma.department.create({ data: { name: "Enfermagem de Clínica Especial", direction_id: directionEnfermagem.id, }, });
    const deptEnfermagemBlocoOperatorio = await prisma.department.create({ data: { name: "Enfermagem do Bloco Operatório", direction_id: directionEnfermagem.id, }, });

    // Seed Departments (Departamentos) under Direção Científica e Pedagógica
    const deptCoordenacaoMedicas = await prisma.department.create({ data: { name: "Coordenação Médicas", direction_id: directionCientificaPedagogica.id, }, });
    const deptEstagiosProfissionais = await prisma.department.create({ data: { name: "Estágios Profissionais", direction_id: directionCientificaPedagogica.id, }, });
    const deptFormacaoContinua = await prisma.department.create({ data: { name: "Formação Contínua", direction_id: directionCientificaPedagogica.id, }, });
    const deptInvestigacaoCientifica = await prisma.department.create({ data: { name: "Investigação Científica", direction_id: directionCientificaPedagogica.id, }, });

    // Seed Services (Serviços) under Direção Administrativa
    const serviceAlimentacaoNutricaoDietetica = await prisma.service.create({ data: { name: "Alimentação, Nutrição e Dietética", direction_id: directionAdministrativa.id, }, });
    const serviceLavandariaHospitalar = await prisma.service.create({ data: { name: "Lavandaria Hospitalar", direction_id: directionAdministrativa.id, }, });
    const serviceApoioGeral = await prisma.service.create({ data: { name: "Apoio Geral", direction_id: directionAdministrativa.id, }, });
    const serviceSegurancaInterna = await prisma.service.create({ data: { name: "Segurança Interna", direction_id: directionAdministrativa.id, }, });
    const serviceRelacoesPublicas = await prisma.service.create({ data: { name: "Relações Públicas", direction_id: directionAdministrativa.id, }, });
    const serviceAcssaoSocial = await prisma.service.create({ data: { name: "Acesso Social", direction_id: directionAdministrativa.id, }, });
    const serviceAdministracaoClinicos = await prisma.service.create({ data: { name: "Administração dos Departamentos Clínicos", direction_id: directionAdministrativa.id, }, });
    const serviceAdministracaoPediatria = await prisma.service.create({ data: { name: "Administração do Departamento de Pediatria", direction_id: directionAdministrativa.id, }, });
    const serviceAdministracaoMedicina = await prisma.service.create({ data: { name: "Administração do Departamento de Medicina", direction_id: directionAdministrativa.id, }, });
    const serviceAdministracaoCirurgia = await prisma.service.create({ data: { name: "Administração do Departamento de Cirurgia", direction_id: directionAdministrativa.id, }, });
    const serviceAdministracaoOrtopedia = await prisma.service.create({ data: { name: "Administração do Departamento de Ortopedia", direction_id: directionAdministrativa.id, }, });
    const serviceAdministracaoGinecObst = await prisma.service.create({ data: { name: "Administração do Departamento de Ginecologia e Obstetrícia", direction_id: directionAdministrativa.id, }, });

    // Seed Services (Serviços) under Direção Clínica
    const serviceBancoSangue = await prisma.service.create({ data: { name: "Banco de Sangue", department_id: deptMedicina.id, }, });
    const serviceLabAnalisesClinicas = await prisma.service.create({ data: { name: "Laboratório de Análises Clínicas", department_id: deptLaboratorio.id, }, });
    const serviceAnatomiaPatologica = await prisma.service.create({ data: { name: "Anatomia Patológica", department_id: deptAnatomiaPatologica.id, }, });
    const serviceMedicinaLegal = await prisma.service.create({ data: { name: "Medicina Legal", department_id: deptMedicina.id, }, });
    const serviceBlocoOperatorio = await prisma.service.create({ data: { name: "Bloco Operatório", department_id: deptCirurgia.id, }, });
    const serviceRadiologiaImagem = await prisma.service.create({ data: { name: "Radiologia e Imagiologia", department_id: deptMedicina.id, }, });
    const serviceFarmarcia = await prisma.service.create({ data: { name: "Farmácia", department_id: deptFarmacia.id, }, });
    const serviceAnestesiologia = await prisma.service.create({ data: { name: "Anestesiologia", department_id: deptMedicina.id, }, });
    const serviceUrgenciasAdultos = await prisma.service.create({ data: { name: "Urgências de Adultos", department_id: deptMedicina.id, }, });
    const serviceUnidadeCuidadosIntensivos = await prisma.service.create({ data: { name: "Unidade de Cuidados Intensivos", department_id: deptMedicina.id, }, });
    const serviceUnidadeGenetica = await prisma.service.create({ data: { name: "Unidade de Genética", department_id: deptMedicina.id, }, });

    // Seed Services (Serviços) under Direção de Enfermagem
    const serviceEnfermagemPediatria = await prisma.service.create({ data: { name: "Enfermagem de Pediatria", department_id: deptEnfermagemPediatria.id, }, });
    const serviceEnfermagemMedicina = await prisma.service.create({ data: { name: "Enfermagem de Medicina", department_id: deptEnfermagemMedicina.id, }, });
    const serviceEnfermagemOrtopedia = await prisma.service.create({ data: { name: "Enfermagem de Ortopedia", department_id: deptEnfermagemOrtopedia.id, }, });
    const serviceEnfermagemGinecologiaObstetricia = await prisma.service.create({ data: { name: "Enfermagem de Ginecologia e Obstetrícia", department_id: deptEnfermagemGinecologiaObstetricia.id, }, });
    const serviceEnfermagemClinicaEspecial = await prisma.service.create({ data: { name: "Enfermagem de Clínica Especial", department_id: deptEnfermagemClinicaEspecial.id, }, });
    const serviceEnfermagemBlocoOperatorio = await prisma.service.create({ data: { name: "Enfermagem do Bloco Operatório", department_id: deptEnfermagemBlocoOperatorio.id, }, });
    const serviceEnfermagemServicoAdultos = await prisma.service.create({ data: { name: "Enfermagem do Serviço de Adultos", department_id: deptEnfermagemMedicina.id, }, });
    const serviceEnfermagemCentralEsterilizacao = await prisma.service.create({ data: { name: "Enfermagem da Central de Esterilização", department_id: deptEnfermagemBlocoOperatorio.id, }, });

    // Seed Services (Serviços) under Medicina Física e Reabilitação
    const serviceOrtoprotesia = await prisma.service.create({ data: { name: "Ortoprotesia", department_id: deptMedicinaFisicaReabilitacao.id, }, });

    // Seed Sectors (Setores) under Services (using only service_id for Próteses and Ortoteses)
    const sectorHidroterapia = await prisma.sector.create({ data: { name: "Hidroterapia", department_id: deptMedicinaFisicaReabilitacao.id, }, });
    const sectorElectroterapia = await prisma.sector.create({ data: { name: "Electroterapia", department_id: deptMedicinaFisicaReabilitacao.id, }, });
    const sectorCentroCirurgico = await prisma.sector.create({ data: { name: "Centro Cirúrgico", department_id: deptCirurgia.id, }, });
    const sectorUrgenciaAdultos = await prisma.sector.create({ data: { name: "Urgência de Adultos", department_id: deptMedicina.id, }, });
    const sectorBioquimica = await prisma.sector.create({ data: { name: "Bioquímica", department_id: deptLaboratorio.id, }, });
    const sectorProteses = await prisma.sector.create({ data: { name: "Próteses", service_id: serviceOrtoprotesia.id, }, });
    const sectorOrtoteses = await prisma.sector.create({ data: { name: "Ortoteses", service_id: serviceOrtoprotesia.id, }, });

    // Seed Repartitions (Repartições) under Departments
    const reparticaoTesouraria = await prisma.repartition.create({ data: { name: "Tesouraria", department_id: deptFinanceiro.id, }, });
    const reparticaoLegalidade = await prisma.repartition.create({ data: { name: "Legalidade", department_id: deptFinanceiro.id, }, });
    const reparticaoContabilidade = await prisma.repartition.create({ data: { name: "Contabilidade", department_id: deptFinanceiro.id, }, });
    const reparticaoAtendimentoAEmpresas = await prisma.repartition.create({ data: { name: "Atendimento a Empresas", department_id: deptFinanceiro.id, }, });
    const reparticaoDireccaoDF = await prisma.repartition.create({ data: { name: "Direcção do DF", department_id: deptFinanceiro.id, }, });
    const reparticaoGestaoOrcamental = await prisma.repartition.create({ data: { name: "Gestão Orçamental", department_id: deptFinanceiro.id, }, });
    const reparticaoRelacoesPublicas = await prisma.repartition.create({ data: { name: "Relações Públicas", department_id: deptRecursosHumanos.id, }, });
    const reparticaoSecretariaRH = await prisma.repartition.create({ data: { name: "Secretaria RH", department_id: deptRecursosHumanos.id, }, });
    const reparticaoDireccaoRH = await prisma.repartition.create({ data: { name: "Direcção dos RH", department_id: deptRecursosHumanos.id, }, });
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