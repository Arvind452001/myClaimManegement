// ===============================
// Base API Configuration
// ===============================
const BASE_URL = "https://node.aitechnotech.in/claim/api/v1";
const TOKEN_KEY = "authToken";
const USER_KEY = "user";

// ===============================
// Token & User Management
// ===============================
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

// ===============================
// API Helper (FETCH WRAPPER)
// ===============================
interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const apiCall = async (
  endpoint: string,
  options: RequestOptions = {},
): Promise<any> => {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    // Network / server down
    throw new Error("Network error. API not reachable.");
  }

  // Unauthorized
  if (response.status === 401) {
    removeToken();
    removeUser();
    window.location.href = "/login";
    return;
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid server response");
  }

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data; // ✅ ALWAYS return parsed JSON
};

// ===============================
// AUTH APIs
// ===============================
export const authAPI = {
  login: async (email: string, password: string) => {
    const data = await apiCall("/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.data?.token) {
      setToken(data.data.token);
      setUser(data.data);
    }

    return data;
  },

  logout: () => {
    removeToken();
    removeUser();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// ===============================
// Generic CRUD Helpers
// ===============================
export const createResource = (endpoint: string, data: any) =>
  apiCall(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getResource = (endpoint: string) =>
  apiCall(endpoint, {
    method: "GET",
  });

export const patchResource = (endpoint: string, data: any) =>
  apiCall(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const updateResource = (endpoint: string, data: any) =>
  apiCall(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteResource = (endpoint: string) =>
  apiCall(endpoint, {
    method: "DELETE",
  });

// ===============================
// RESOURCE APIs
// ===============================
// export const casesAPI = {
//   createCase: (data: any) => createResource("/case/create", data),

//   updateCase: (id: string, data: any) =>
//     patchResource(`/case/update/${id}`, data),

//   getCaseById: (id: string) => getResource(`/case/${id}`),

//   getAllCases: () => getResource("/case/all"),

//   deleteCase: (id: string) => deleteResource(`/cases/${id}`),

//   /* ================= SUB SECTIONS ================= */

//   addActivity: (id: string, data: any) =>
//     createResource(`/case/activity-log`, data),

//   addNote: (id: string, data: any) =>
//     createResource(`/case/notes/create`, data),

//   addMessage: (data: any) =>
//     createResource(`/case-message/create`, data),

//   addCommunication: (data: any) =>
//     createResource(`/case/addCommunication`, data),

//   addEmail: (id: string, data: any) =>
//     createResource(`/case-mail/create`, data),

//   addTimeLoss: (data: any) =>
//     createResource(`/time/loss/create`, data),

//   addDocument: async (data: FormData) => {
//     const token = localStorage.getItem("authToken");

//     const response = await fetch(`${BASE_URL}/case-documents/upload`, {
//       method: "POST",
//       headers: {
//         ...(token && { Authorization: `Bearer ${token}` }),
//       },
//       body: data,
//     });

//     if (!response.ok) {
//       throw new Error("Upload failed");
//     }

//     return response.json();
//   },

//   addProtest: (data: any) =>{
//     console.log("payload",data)
// return createResource(`/case-protest-appeal/create`, data)
//   }
    
// };

export const casesAPI = {
  // Step 1 - Create Case (Overview)
  createCase: (data: any) => createResource("/case/create", data),

  // Update main case (Claim Info)
  updateCase: (id: string, data: any) => {
    // console.log("Case ID:", id);
    // console.log("Payload:", data);
    return patchResource(`/case/update/${id}`, data);
  },

  getCaseById: (id: string) => getResource(`/case/${id}`),

  getAllCases: () => getResource("/case/all"),

  getAllCaseID: () => getResource("/case/caseId/id"),

  deleteCase: (id: string) => deleteResource(`/case/${id}`),

  /* ================= SUB SECTIONS ================= */
  addClaim: (
    id: string,
    data: any, // --pending
  ) => createResource(`/case/${id}/activity`, data),

  addActivity: (id: string, data: any) => {
    return createResource(
      `/case/activity-log`,

      data,
    );
  },

  addNote: (id: string, data: any) => {
    return createResource(`/case/notes/create`, data);
  },

  addMessage: (data: any) =>
    createResource(`/case-message/create`, data),

  addCommunication: (data: any) =>
    createResource(`/case-message/create`, data),

  addEmail: (id: string, data: any) =>
    createResource(`/case-mail/create`, data),

addTimeLoss: async (data: any) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`${BASE_URL}/time/loss/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
    return;
  }

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.message || "Time Loss creation failed");
  }

  return result;
},

  ///============================////

  addDocument: async (data: FormData) => {
  const token = localStorage.getItem("authToken");

  try {
    const response = await fetch(`${BASE_URL}/case-documents/upload`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: data,
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!response.ok) {
      throw new Error(result?.message || "Upload failed");
    }

    return result;
  } catch (error: any) {
    throw new Error(error.message || "Network error");
  }
},

  ///==========================/////

  addProtest: (data: any) => {
    // console.log("ddddddddddddddddddd");
    // console.log("addProtest", data);
    return createResource(`/case-protest-appeal/create`, data);
  },
};

export const staffAPI = {
  getStaffMember: () => getResource("/user/all"),

  getUserById: async (id: string) =>await getResource(`/user/byId/${id}`),
};

export const contactsAPI = {
  getAll: () => getResource("/contact/all"),
  getById: (id: string) => getResource(`/contact/${id}`),
  create: (data: any) => createResource("/contact/create", data),
  update: (data: any) => patchResource(`/contact/update`, data),
  delete: (id: string) => deleteResource(`/contact/delete/${id}`),
  getRecent: () => getResource("/contacts/recent"),

  getAllCaseContacts: () => getResource("/case-contact/all"),
  createCaseContact: (data: any) =>
    createResource("/case-contact/create", data),
  deleteCaseContact: (id: string) =>
    deleteResource(`/case-contact/delete/${id}`),
};

export const tasksAPI = {
  getAll: () => getResource("/task/all"),
  getById: (id: string) => getResource(`/tasks/${id}`),
  create: (data: any) =>{
    console.log("create-data",data)
  return  createResource("/task/create", data)
  } ,
  update: (data: any) => {
    console.log("update-data", data);
    return patchResource(`/task/update`, data);
  },
  delete: (id: string) => deleteResource(`/task/${id}`),
  getRecent: () => getResource("/task/recent/dashboard"),
};

export const massageAPI = {
  getAll: async () => {
    const res = await getResource("/message/find/all");
    return res.data;
  },
  getById: (id: string) => getResource(`/message/find/${id}`),
  create: (data: any) => createResource("/message/create", data),
  update: (data: any) => patchResource(`/message/update`, data),
  delete: (id: string) => deleteResource(`/message/delete/${id}`),
};

export const callLogsAPI = {
  getAll: () => getResource("/call-log/all"),
  getById: (id: string) => getResource(`/calllogs/${id}`),
  create: (data: any) => createResource("/call-log/create", data),
  update: (data: any) => patchResource(`/call-log/update`, data),
  delete: (id: string) => deleteResource(`/call-log/delete/${id}`),
};

export const timeLossAPI = {
  getAll: () => getResource("/time/loss/all"),
  getById: (id: string) => getResource(`/timeloss/${id}`),
  create: (data: any) => {
    console.log("vvvvvvv", data);
    createResource("/time/loss/create", data);
  },
  update: (data: any) => patchResource(`/time/loss/update`, data),
  delete: (id: string) => deleteResource(`/time/loss/delete/${id}`),
};

export const feeListAPI = {
  getAll: () => getResource("/fee/all"),
  getById: (id: string) => getResource(`/fee/find/${id}`),
  create: (data: any) => createResource("/fee/create", data),
  update: (data: any) => patchResource("/fee/update", data),
  delete: (id: string) => deleteResource(`/fee/${id}`),
};

export const excelAPI = {
  getAll: () => getResource("/excel/all"),

  getById: (id: string) => getResource(`/excel/find/${id}`),

  //    upload: (data: any) =>{
  //     console.log("upload api",data)
  // createResource(`/excel/create`, data)
  //    } ,
  // Independent Upload API
  upload: async (data: FormData) => {
    const token = localStorage.getItem("authToken"); // make sure key name matches

    if (!token) {
      throw new Error("No token found. Please login again.");
    }

    const response = await fetch(
      "https://node.aitechnotech.in/claim/api/v1/excel/create",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // 🔥 attach token
        },
        body: data, // ❗ don't set Content-Type
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message || "Upload failed",
      );
    }

    return result;
  },

update: async (data: {
  id: string;
  sheetName?: string;
  sheetType?: string;
  status?: string;
  file?: File;
}) => {
  const token = localStorage.getItem("authToken");

  if (!data.id) {
    throw new Error("ID is required");
  }

  // 🟢 CASE 1: No file → Send JSON (like Postman)
  if (!data.file) {
    return apiCall("/excel/update", {
      method: "PATCH",
      body: JSON.stringify({
        id: data.id,
        sheetName: data.sheetName,
        sheetType: data.sheetType,
        status: data.status,
      }),
    });
  }

  // 🔵 CASE 2: File exists → Send FormData
  const formData = new FormData();

  formData.append("id", data.id);
  if (data.sheetName) formData.append("sheetName", data.sheetName);
  if (data.sheetType) formData.append("sheetType", data.sheetType);
  if (data.status) formData.append("status", data.status);
  formData.append("file", data.file);

 for (let pair of formData.entries()) {
  console.log("bbbbbbbbbb",pair[0], pair[1]);
}
  const response = await fetch(`${BASE_URL}/excel/update`, {
    method: "PATCH",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      // ❌ DO NOT set Content-Type
    },
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(result.message)
        ? result.message.join(", ")
        : result.message || "Update failed"
    );
  }

  return result;
},

  delete: (id: string) => deleteResource(`/excel/delete/${id}`),
};

export const eventsAPI = {
  getAll: () => getResource("/event/all"),
  getById: (id: string) => getResource(`/events/${id}`),
  create: (data: any) => createResource("/event/create", data),
  update: (data: any) => patchResource(`/event/update`, data),
  delete: (id: string) => deleteResource(`/event/${id}`),
};

export const clientsAPI = {
  getAll: () => getResource("/client/all"),
  getById: (id: string) => getResource(`/client/by-id/${id}`),
  create: (data: any) => createResource("/client/create", data),
  update: (data: any) => patchResource("/client/update", data),
  delete: (id: string) => deleteResource(`/client/delete/${id}`),
};




export const conversationAPI = {
  /* ================= DIRECT CONVERSATION ================= */
  createOrGetDirect: (participantId: string) =>{
const res=  createResource(`/conversation/direct/${participantId}`,{})
console.log("createOrGetDirect",res)
return res; // 🔥 IMPORTANT
  },
    


  /* ================= GROUP CONVERSATION ================= */
  createGroup: (data: {
    title: string;
    participants: string[];
  }) => createResource("/conversation/group", data),

  /* ================= GET ALL CONVERSATIONS ================= */
  getAll: () => getResource("/conversation/all"),

  /* ================= GET BY ID ================= */
  myConversation: () =>
    getResource(`/conversation/my`),

  /* ================= DELETE CONVERSATION ================= */
  delete: (id: string) =>
    deleteResource(`/conversation/delete/${id}`),

  /* ================= UPDATE GROUP TITLE ================= */
  updateGroupTitle: (data: {
    conversationId: string;
    title: string;
  }) => patchResource("/conversation/update-title", data),
};

// ===============================
// CHAT MESSAGE APIs (Dummy - for future implementation)
// ===============================
export const messageStatusAPI = {
  /* DUMMY API: Update message delivery status */
  updateStatus: async (messageId: string, status: "sent" | "delivered" | "read") => {
    // Mock API implementation - replace with real API when backend is ready
    return {
      success: true,
      messageId,
      status,
      timestamp: new Date().toISOString(),
    };
  },

  /* DUMMY API: Get message read receipts */
  getReadReceipts: async (messageId: string) => {
    return {
      messageId,
      readBy: [],
      deliveredTo: [],
    };
  },
};

export const messageReactionAPI = {
  /* DUMMY API: Add emoji reaction to message */
  addReaction: async (messageId: string, emoji: string, userId: string) => {
    return {
      success: true,
      messageId,
      emoji,
      userId,
      timestamp: new Date().toISOString(),
    };
  },

  /* DUMMY API: Remove emoji reaction from message */
  removeReaction: async (messageId: string, emoji: string, userId: string) => {
    return {
      success: true,
      messageId,
      emoji,
      userId,
    };
  },

  /* DUMMY API: Get all reactions for a message */
  getReactions: async (messageId: string) => {
    return {
      messageId,
      reactions: [],
    };
  },
};

export const typingIndicatorAPI = {
  /* DUMMY API: Emit typing event (handled via socket, this is just for reference) */
  emitTyping: async (conversationId: string, userId: string) => {
    // Typing is typically handled via socket.io, not HTTP
    // This is a placeholder for consistency
    return {
      conversationId,
      userId,
      isTyping: true,
    };
  },

  /* DUMMY API: Stop typing event */
  stopTyping: async (conversationId: string, userId: string) => {
    return {
      conversationId,
      userId,
      isTyping: false,
    };
  },
};

// ===============================
// Default Export (optional)
// ===============================
export default {
  authAPI,
  casesAPI,
  contactsAPI,
  tasksAPI,
  callLogsAPI,
  timeLossAPI,
  feeListAPI,
  excelAPI,
  eventsAPI,
};
