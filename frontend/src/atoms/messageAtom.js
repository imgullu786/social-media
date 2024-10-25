import { atom } from "recoil";

export const conversationsAtom = atom({
	key: "conversationsAtom",
	default: [],
});

export const selectedConversationAtom = atom({
	key: "selectedConversationAtom",
	default: {
		mock:false,
		_id: "",
		userId: "",
		username: "",
		fullname: "",
		profileImg: "",
	},
});
