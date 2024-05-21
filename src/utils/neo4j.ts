import neo4j from 'neo4j-driver';
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'password';
const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
)

const saveToNeo4j = async (address:string, startBlock:number, endBlock:number):Promise<string> => {
    const session = driver.session();

    try {
        const result = await session.run(
            `
                MERGE (w:Wallet {address: $address})
                ON CREATE SET w.startBlock = $startBlock, w.endBlock = $endBlock
                ON MATCH SET w.startBlock = $startBlock, w.endBlock = $endBlock
                RETURN w
            `,
            {
                address,
                startBlock,
                endBlock,
            }
        );
        console.log("Wallet saved or updated:", result.records[0].get('w').properties);
        return 'Data saved to Neo4j successfully';
    } catch (error) {
        console.error("Error saving wallet to Neo4j", error);
        throw error;
    } finally {
        await session.close();
    }
};

export default saveToNeo4j;