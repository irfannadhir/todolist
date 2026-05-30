"use client";

import { format, parseISO } from "date-fns";
import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { UserForm } from "@/features/users/components/user-form";
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUsers,
} from "@/features/users/hooks/use-users";
import {
  type UserItem,
  type UserPayload,
  type UserUpdatePayload,
} from "@/features/users/types/user";

const EMPTY_USERS: UserItem[] = [];

export default function UsersPage() {
  const usersQuery = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const users = usersQuery.data ?? EMPTY_USERS;

  const resetError = () => setErrorMessage(null);

  const handleCreateUser = async (payload: UserPayload) => {
    try {
      resetError();
      await createMutation.mutateAsync(payload);
      setIsUserModalOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal membuat user",
      );
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
      setIsUserModalOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal mengupdate user",
      );
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
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal menghapus user",
      );
    }
  };

  const openCreateModal = () => {
    resetError();
    setSelectedUser(null);
    setFormMode("create");
    setIsUserModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    resetError();
    setSelectedUser(user);
    setFormMode("edit");
    setIsUserModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[22px] bg-[#003c33] p-6 text-white sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#ffad9b]">
          User Management
        </p>
        <h1 className="mt-2 text-4xl leading-tight tracking-tight sm:text-5xl">
          Kelola User
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#edfce9] sm:text-base">
          CRUD user menggunakan email dan password untuk akses login dashboard.
        </p>
      </section>

      {errorMessage ? (
        <div className="rounded-md border border-[#ffad9b] bg-[#fff4ef] px-4 py-3 text-sm text-[#b30000]">
          {errorMessage}
        </div>
      ) : null}

      <section className="rounded-[22px] border border-[#d9d9dd] bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl tracking-tight text-[#17171c]">
              Daftar User
            </h2>
            <p className="mt-1 text-sm text-[#616161]">
              Klik edit untuk update email/password user.
            </p>
          </div>
          <Button onClick={openCreateModal}>Tambah User</Button>
        </div>

        {users.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-[#d9d9dd] bg-[#f8f8f8] p-5 text-sm text-[#616161]">
            Belum ada user.
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-left text-[#75758a]">
                  <th className="py-2 pr-3 font-medium">No</th>
                  <th className="py-2 pr-3 font-medium">Nama</th>
                  <th className="py-2 pr-3 font-medium">Email</th>
                  <th className="py-2 pr-3 font-medium">Created</th>
                  <th className="py-2 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className="border-b border-[#f1f1f1]">
                    <td className="py-3 pr-3 text-[#17171c]">{index + 1}</td>
                    <td className="py-3 pr-3 text-[#17171c]">{user.name}</td>
                    <td className="py-3 pr-3 text-[#17171c]">{user.email}</td>
                    <td className="py-3 pr-3 text-[#616161]">
                      {format(parseISO(user.createdAt), "dd MMM yyyy HH:mm")}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => openEditModal(user)}>
                          Edit
                        </Button>
                        <ConfirmDialog
                          title="Hapus User"
                          description={`Apakah Anda yakin ingin menghapus user "${user.email}"? Tindakan ini tidak dapat dibatalkan.`}
                          confirmText="Hapus"
                          isLoading={deleteMutation.isPending}
                          onConfirm={() => handleDeleteUser(user.id)}
                          trigger={
                            <Button variant="destructive" size="sm">
                              Hapus
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Dialog
        open={isUserModalOpen}
        onOpenChange={(open) => {
          setIsUserModalOpen(open);
          if (!open) {
            setSelectedUser(null);
            setFormMode("create");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Buat User Baru" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "create"
                ? "User baru bisa langsung dipakai untuk login."
                : selectedUser
                  ? `Perbarui data untuk ${selectedUser.name} (${selectedUser.email}).`
                  : "Pilih user untuk diedit."}
            </DialogDescription>
          </DialogHeader>

          {formMode === "create" ? (
            <UserForm
              key="create-user"
              mode="create"
              onSubmit={handleCreateUser}
              isSubmitting={createMutation.isPending}
              submitLabel="Simpan User"
            />
          ) : selectedUser ? (
            <UserForm
              key={`edit-${selectedUser.id}`}
              mode="edit"
              defaultValues={{
                name: selectedUser.name,
                email: selectedUser.email,
                password: "",
              }}
              onSubmit={handleUpdateUser}
              isSubmitting={updateMutation.isPending}
              submitLabel="Update User"
            />
          ) : (
            <p className="text-sm text-[#616161]">
              User tidak ditemukan untuk diedit.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
