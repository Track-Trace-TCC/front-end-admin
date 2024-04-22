'use client'

import PrivateRoute from "./utils/private-route";
import { Button } from "@/components/ui/button";

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button
        onClick={() => sessionStorage.removeItem('token')}
      >Teste</Button>
    </main>
  );
}

export default PrivateRoute(Home);
