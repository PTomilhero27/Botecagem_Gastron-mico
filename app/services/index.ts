// /* eslint-disable @typescript-eslint/no-unused-expressions */
// import { botecagem } from "./http";
// import { CreateProps, EditProps, GetAllProps } from "./types";

// export const apiService = {
//   async getAll<T>({ url, params }: GetAllProps): Promise<T> {
//     const response = await botecagem.get(url, {
//       searchParams: {
//         ...params,
//       },
//     });

//     const data: T = await response.json();

//     return data;
//   },

//   // async getById({ url, id }: GetByIdProps) {
//   //   const response = await iaWaves.get(`${url}/${id}`, {

//   //   });

//   //   const data = await response.json();

//   //   return data;
//   // },

//   async create<T>({ url, json }: CreateProps): Promise<T> {
//     const response = await botecagem.post(url, {
//       json,
//     });
//     const data: T = await response.json();
//     return data;
//   },

//   async edit<T>({ url, json, id }: EditProps) {
//     const response = await botecagem.put(`${url}/${id}`, {
//       json,
//     });
//     const data: T = await response.json();
//     return data;
//   },

//   // async delete({ url, service, id }: DeleteProps) {
//   //   const response = await http[service].delete(`${url}/${id}`);
//   //   return response;
//   // },
// };