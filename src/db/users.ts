import { readJsonFile, writeJsonFile } from './local-db-util';

interface UserRecord {
  id: number;
  uid: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

const FILENAME = 'users.json';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  const users = readJsonFile<UserRecord[]>(FILENAME, []);
  const index = users.findIndex((u) => u.uid === uid);
  const now = new Date().toISOString();

  if (index !== -1) {
    users[index].email = email;
    if (name) users[index].name = name;
    writeJsonFile(FILENAME, users);
    return users[index];
  }

  const newUser: UserRecord = {
    id: Date.now(),
    uid,
    email,
    name: name || null,
    role: 'admin',
    createdAt: now,
  };

  users.push(newUser);
  writeJsonFile(FILENAME, users);
  return newUser;
}
