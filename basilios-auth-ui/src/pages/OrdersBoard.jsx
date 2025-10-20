import SidebarUser from "../components/SidebarUser.jsx";
import BoardTrello from "../components/BoardTrello.jsx";

export default function OrdersBoard(){
    return(
        <main className="flex-1">
            <SidebarUser />
            <BoardTrello />
        </main>
    )
}