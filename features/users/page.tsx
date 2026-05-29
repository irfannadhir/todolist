"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";

import { UserForm } from "@/features/users/components/user-form";
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from "@/features/users/hooks/use-users";
import { type UserItem, type UserPayload, type UserUpdatePayload } from "@/features/users/types/user";

const EMPTY_USERS: UserItem[] = [];

export default function UsersPage() {
  const usersQuery = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const users = usersQuery.data ?? EMPTY_USERS;

  const resetError = () => setErrorMessage(null);

  const handleCreateUser = async (payload: UserPayload) => {
    try {
      resetError();
      await createMutation.mutateAsync(payload);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal membuat user");
    }
  };

  const handleUpdateUser = async (payload: UserUpdatePayload) => {
    if (!selectedUser) {
      return;
    }

    try {
      resetError();
      await updateMutation.mutateAsync({ id: selectedUser.id, payload });
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengupdate user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      resetError();
      await deleteMutation.mutateAsync(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal menghapus user");
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] bg-[#003c33] p-6 text-white sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffad9b]">User Management</p>
        <h1 className="mt-2 text-4xl leading-tight tracking-tight sm:text-5xl">Kelola User</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#edfce9] sm:text-base">
          CRUD user menggunakan email dan password untuk akses login dashboard.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-md border border-[#ffad9b] bg-[#fff4ef] px-4 py-3 text-sm text-[#b30000]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
          <h2 className="text-2xl tracking-tight text-[#17171c]">Daftar User</h2>
          <p className="mt-1 text-sm text-[#616161]">Klik edit untuk update email/password user.</p>

          {users.length === 0 ? (
            <div className="mt-6 rounded-md border border-dashed border-[#d9d9dd] bg-[#f8f8f8] p-5 text-sm text-[#616161]">
              Belum ada user.
            </div>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-left text-[#75758a]">
                    <th className="py-2 pr-3 font-medium">Email</th>
                    <th className="py-2 pr-3 font-medium">Created</th>
                    <th className="py-2 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-[#f1f1f1]">
                      <td className="py-3 pr-3 text-[#17171c]">{user.email}</td>
                      <td className="py-3 pr-3 text-[#616161]">
                        {format(parseISO(user.createdAt), "dd MMM yyyy HH:mm")}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-[#17171c] px-3 py-1 text-xs font-medium text-white transition hover:bg-[#003c33]"
                            onClick={() => setSelectedUser(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-full border border-[#ff7759] px-3 py-1 text-xs font-medium text-[#ff7759] transition hover:bg-[#fff4ef]"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
            <h2 className="text-2xl tracking-tight text-[#17171c]">Buat User Baru</h2>
            <p className="mt-1 text-sm text-[#616161]">User baru bisa langsung dipakai untuk login.</p>
            <div className="mt-5">
              <UserForm
                mode="create"
                onSubmit={handleCreateUser}
                isSubmitting={createMutation.isPending}
                submitLabel="Simpan User"
              />
            </div>
          </section>

          <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
            <h2 className="text-2xl tracking-tight text-[#17171c]">Edit User</h2>
            {selectedUser ? (
              <>
                <p className="mt-1 text-sm text-[#616161]">User aktif: {selectedUser.email}</p>
                <div className="mt-5">
                  <UserForm
                    key={selectedUser.id}
                    mode="edit"
                    defaultValues={{ email: selectedUser.email, password: "" }}
                    onSubmit={handleUpdateUser}
                    isSubmitting={updateMutation.isPending}
                    submitLabel="Update User"
                  />
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-[#616161]">Pilih user dari tabel untuk edit.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
