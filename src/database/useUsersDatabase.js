import { useSQLiteContext } from "expo-sqlite";
export function useUsersDatabase() {
    const database = useSQLiteContext();
    async function authUser({ username, senha }) {
        console.log("authUser username: ", username, " - senha: ", senha);
        try {
            const result = await database.getFirstAsync(`
                
                SELECT id, username, role FROM users WHERE username = '${username}' AND senha = '${senha}'
                
                `);
            return result;
        } catch (error) {
            console.error("useUsersDatabase.authUser: ", error);
            throw error;
        }
    }
    return{
        authUser,
    }
}