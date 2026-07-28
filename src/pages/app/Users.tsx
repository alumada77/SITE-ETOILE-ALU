import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Lock, 
  Mail, 
  ShieldAlert,
  Pencil,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { Toast, ToastType } from '../../components/ui/Toast';
import { ConfirmModal } from '../../components/ui/ConfirmModal';

export const UsersPage: React.FC = () => {
  const { currentUser, isAdmin, users, register, updateUserRole, updateUser, deleteUserAccount } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('manager');

  if (!isAdmin) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <ShieldAlert className="w-16 h-16 mx-auto text-amber-500 animate-bounce" />
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Accès Réservé aux Administrateurs</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Seul un administrateur système peut consulter et modifier les privilèges des utilisateurs.
        </p>
      </div>
    );
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      setToast({ message: `Utilisateur ${name} créé avec le rôle ${role}`, type: 'success' });
      setIsModalOpen(false);
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur de création d\'utilisateur', type: 'error' });
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      setToast({ message: 'Rôle utilisateur mis à jour', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Erreur lors du changement de rôle', type: 'error' });
    }
  };

  const handleUpdateUser = async () => {
    if (!editUserId) return;

    try {
      await updateUser(editUserId, {
        name: editName,
        email: editEmail,
        role: editRole
      });

      setToast({
        message: "Informations utilisateur mises à jour",
        type: "success"
      });

      setEditUserId(null);

    } catch (err: any) {
      setToast({
        message: err.message || "Erreur de modification",
        type: "error"
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteUserAccount(deleteTargetId);
      setToast({ message: 'Compte utilisateur supprimé', type: 'success' });
    } catch (err: any) {
      setToast({ message: err.message || 'Erreur lors de la suppression', type: 'error' });
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Supprimer cet utilisateur ?"
        message="Êtes-vous sûr de vouloir révoquer l'accès de cet utilisateur au système ?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Utilisateurs & Habilitations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Contrôle des accès Collaborateurs, Gestionnaires et Administrateurs
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setEmail('');
            setPassword('');
            setRole('manager');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-colors shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Utilisateur
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase bg-slate-50 dark:bg-slate-800/40">
                <th className="py-4 px-4">Utilisateur</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Rôle Attribué</th>
                <th className="py-4 px-4">Inscrit Le</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 font-bold flex items-center justify-center text-xs">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <span>{u.name} {u.uid === currentUser?.uid && <span className="text-[10px] text-amber-500 font-mono">(Vous)</span>}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={u.role}
                      disabled={u.uid === currentUser?.uid}
                      onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                      className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="admin">ADMINISTRATEUR (Complet)</option>
                      <option value="manager">GESTIONNAIRE (Atelier)</option>
                      <option value="visitor">VISITEUR (Lecture)</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">{u.createdAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex justify-end gap-2">

                      {/* Modifier */}
                      {u.uid !== currentUser?.uid && (
                        <button
                          onClick={() => {
                            setEditUserId(u.uid);
                            setEditName(u.name);
                            setEditEmail(u.email);
                            setEditRole(u.role);
                            setIsEditModalOpen(true); // <-- ity no manokatra modal
                          }}
                          className="p-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          title="Modifier utilisateur"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}

                      {/* Supprimer */}
                      {u.uid !== currentUser?.uid && (
                        <button
                          onClick={() => setDeleteTargetId(u.uid)}
                          className="p-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Révoquer le compte"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                CRÉER UN NOUVEL ACCÈS UTILISATEUR
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nom & Prénom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Marc Rabe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Adresse Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="m.rabe@etoile-alu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Mot de Passe Initial *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Rôle de Permission *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-slate-700"
                >
                  <option value="manager">GESTIONNAIRE (Commandes, Devis, Stock)</option>
                  <option value="admin">ADMINISTRATEUR (Accès Total & Suppression)</option>
                  <option value="visitor">VISITEUR (Consultation Seule)</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md"
                >
                  Créer l'Utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">

          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border">

            <div className="flex items-center justify-between px-6 py-4 bg-blue-900 text-white">
              <h3 className="text-xs font-black text-blue-300 uppercase tracking-widest">
                MODIFIER UTILISATEUR
              </h3>

              <button
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-5 h-5"/>
              </button>
            </div>


            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">

              <input
                type="text"
                value={editName}
                onChange={(e)=>setEditName(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800"
                placeholder="Nom"
              />


              <input
                type="email"
                value={editEmail}
                onChange={(e)=>setEditEmail(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800"
                placeholder="Email"
              />


              <select
                value={editRole}
                onChange={(e)=>setEditRole(e.target.value as UserRole)}
                className="w-full px-3 py-3 rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <option value="admin">
                  ADMINISTRATEUR
                </option>

                <option value="manager">
                  GESTIONNAIRE
                </option>

                <option value="visitor">
                  VISITEUR
                </option>

              </select>


              <div className="flex justify-end gap-3 pt-4">

                <button
                  type="button"
                  onClick={()=>setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200"
                >
                  Annuler
                </button>


                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  Enregistrer
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </div>
  );
};
