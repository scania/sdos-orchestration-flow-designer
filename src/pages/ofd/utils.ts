export const assignClassData = (type: string) => {
  switch (type) {
    case "HTTP Action":
      return {
        "@id": "iris:aeca5978_21af_4c8d_af8f_f2e68e2a3417",
        "@type": ["owl:NamedIndividual", "iris:Task"],
        "iris:hasAction": {
          "@id": "iris:301acd01_19b5_4f19_ab76_ee13ffb57c00",
        },
        "rdfs:label": "GetPizzasAndAllergenes",
      };
    case "Task":
      return {
        "@id": "iris:301acd01_19b5_4f19_ab76_ee13ffb57c00",
        "@type": ["owl:NamedIndividual", "iris:HTTPAction"],
        "iris:endpoint": "pizzas/",
        "iris:httpHeader": {
          "@value": '{"Accept": "application/json"}',
        },
      };
    default:
      return {};
  }
};

const jsonLdContext = {
  rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  owl: "http://www.w3.org/2002/07/owl#",
  rdfs: "http://www.w3.org/2000/01/rdf-schema#",
  iris: "https://kg.scania.com/it/iris_orchestration/",
};

export const generateJsonLdFromState = ({ nodes, edges }) => {
  const graphData: any[] = [];
  edges.forEach((edge: any) => {
    const { source, target } = edge;
    const sourceObjData = nodes.find((node: any) => node.id === source).data;
    const targetObjData = nodes.find((node: any) => node.id === target).data;
    const sourceObjClassData = sourceObjData?.classData || {};
    const targetObjClassData = targetObjData?.classData || {};
    graphData.push(sourceObjClassData);
    graphData.push(targetObjClassData);
    // console.log(edge);
    // console.log({ sourceObjData, targetObjData });
    // console.log({ sourceObjClassData, targetObjClassData });
  });

  const jsonLdPayload = {
    "@context": jsonLdContext,
    "@graph": graphData,
  };
  return jsonLdPayload;
};
