// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable react-hooks/rules-of-hooks */
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { CreateProps, EditProps, GetAllProps } from "./types";
// import { apiService } from ".";
// import { useToast } from "@/components/ui/toast/use-toast";

// export const GetAll = <T>({ url, params, enabled = true }: GetAllProps) => {
//   return useQuery<T>({
//     queryKey: [url, params],
//     queryFn: async () => {
//       const res = await apiService.getAll<T>({ url, params });
//       return res;
//     },
//     enabled,
//   });
// };

// export const Create = <T>({ url }: CreateProps): any => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (json: any) => {
//       const res = await apiService.create<T>({ url, json });
//       return res;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: [url] });
//     },
//   });
// };

// export const Edit = <T>({ url, queryKeys }: EditProps) => {
//   const toast = useToast();

//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ json, id }: any) => {
//       const res = await apiService.edit<T>({ url, json, id });

//       return res;
//     },
//     onError: (error) => {
//       toast.toast({
//         variant: "error",
//         title: `Erro ao editar o registro`,
//         description: error.message,
//       });
//     },
//     onSuccess: () => {
//       if (queryKeys) {
//         queryClient.invalidateQueries(queryKeys as any);
//       } else {
//         queryClient.invalidateQueries({ queryKey: [url] });
//       }

//       toast.toast({
//         variant: "success",
//         title: "Registro editado com sucesso!",
//       });
//     },
//   });
// };

// // const remove = ({ url, queryKey }: DeleteProps) => {
// //   const queryClient = useQueryClient();
// //   const toast = useToast();

// //   return useMutation({
// //     mutationFn: async (id: number) => {
// //       const res = await transactionService.delete({ url, id });

// //       return res;
// //     },
// //     onError: async (error) => {
// //       toast.error(`Erro ao deletar o registro: ${error.message}`);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey });
// //       toast.success("Registro deletado com sucesso!");
// //     },
// //   });
// // };