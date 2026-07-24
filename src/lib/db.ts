import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  budget: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  createdAt: string;
}

interface DatabaseSchema {
  leads: LeadRecord[];
  users: UserRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'leaddesk_db.json');

function ensureDirectoryExists(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExists(dirname);
  fs.mkdirSync(dirname);
}

function readDatabase(): DatabaseSchema {
  try {
    ensureDirectoryExists(DB_FILE_PATH);
    if (!fs.existsSync(DB_FILE_PATH)) {
      const initialDb = seedInitialDatabase();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.leads || !parsed.users) {
      const initialDb = seedInitialDatabase();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialDb, null, 2), 'utf-8');
      return initialDb;
    }
    return parsed;
  } catch (error) {
    console.error('Error reading database file:', error);
    const initialDb = seedInitialDatabase();
    return initialDb;
  }
}

function seedInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('AdminSecret123!', salt);

  return {
    users: [
      {
        id: crypto.randomUUID(),
        email: 'admin@leaddesk.com',
        name: 'LeadDesk Admin',
        passwordHash,
        createdAt: new Date().toISOString(),
      },
    ],
    leads: [
      {
        id: crypto.randomUUID(),
        name: 'Sarah Connor',
        email: 'sarah@cyberdyne-defense.com',
        budget: '$10k - $25k',
        message: 'Looking for a custom CRM dashboard for our consulting team.',
        status: 'NEW',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Alexander Wright',
        email: 'alex@fintechscale.io',
        budget: '$25k - $50k',
        message: 'We need full-stack developers to rebuild our lead capture flow.',
        status: 'CONTACTED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Elena Rostova',
        email: 'elena@designstudio.org',
        budget: '$5k - $10k',
        message: 'Interested in a website redesign with dynamic lead forms.',
        status: 'CLOSED',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
      },
    ],
  };
}

function writeDatabase(data: DatabaseSchema): void {
  try {
    ensureDirectoryExists(DB_FILE_PATH);
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing to database file:', error);
  }
}

export const db = {
  lead: {
    async create({ data }: { data: Omit<LeadRecord, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: LeadRecord['status'] } }) {
      const dbData = readDatabase();
      const now = new Date().toISOString();
      const newLead: LeadRecord = {
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        budget: data.budget,
        message: data.message,
        status: data.status || 'NEW',
        createdAt: now,
        updatedAt: now,
      };

      dbData.leads.unshift(newLead);
      writeDatabase(dbData);
      return newLead;
    },

    async findMany(args?: { where?: any; orderBy?: any }) {
      const dbData = readDatabase();
      let results = [...dbData.leads];

      if (args?.where) {
        const { status, OR } = args.where;
        if (status) {
          results = results.filter((l) => l.status === status);
        }
        if (OR && Array.isArray(OR)) {
          results = results.filter((l) =>
            OR.some((condition: any) => {
              if (condition.name?.contains) {
                return l.name.toLowerCase().includes(condition.name.contains.toLowerCase());
              }
              if (condition.email?.contains) {
                return l.email.toLowerCase().includes(condition.email.contains.toLowerCase());
              }
              if (condition.message?.contains) {
                return l.message.toLowerCase().includes(condition.message.contains.toLowerCase());
              }
              if (condition.budget?.contains) {
                return l.budget.toLowerCase().includes(condition.budget.contains.toLowerCase());
              }
              return false;
            })
          );
        }
      }

      if (args?.orderBy?.createdAt === 'desc') {
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return results;
    },

    async findUnique({ where }: { where: { id: string } }) {
      const dbData = readDatabase();
      return dbData.leads.find((l) => l.id === where.id) || null;
    },

    async count(args?: { where?: { status?: string } }) {
      const dbData = readDatabase();
      if (!args?.where?.status) {
        return dbData.leads.length;
      }
      return dbData.leads.filter((l) => l.status === args.where?.status).length;
    },

    async update({ where, data }: { where: { id: string }; data: Partial<LeadRecord> }) {
      const dbData = readDatabase();
      const index = dbData.leads.findIndex((l) => l.id === where.id);
      if (index === -1) {
        throw new Error('Lead not found');
      }

      const updatedLead = {
        ...dbData.leads[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };

      dbData.leads[index] = updatedLead;
      writeDatabase(dbData);
      return updatedLead;
    },

    async delete({ where }: { where: { id: string } }) {
      const dbData = readDatabase();
      const index = dbData.leads.findIndex((l) => l.id === where.id);
      if (index === -1) {
        throw new Error('Lead not found');
      }

      const deleted = dbData.leads.splice(index, 1)[0];
      writeDatabase(dbData);
      return deleted;
    },
  },

  user: {
    async findUnique({ where }: { where: { email: string } }) {
      const dbData = readDatabase();
      return dbData.users.find((u) => u.email.toLowerCase() === where.email.toLowerCase()) || null;
    },

    async create({ data }: { data: Omit<UserRecord, 'id' | 'createdAt'> }) {
      const dbData = readDatabase();
      const newUser: UserRecord = {
        id: crypto.randomUUID(),
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        createdAt: new Date().toISOString(),
      };
      dbData.users.push(newUser);
      writeDatabase(dbData);
      return newUser;
    },

    async count() {
      const dbData = readDatabase();
      return dbData.users.length;
    },
  },
};
