import { type NextPage } from "next";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  const { mutate } = api.admin.sensitive.useMutation();

  return (
    <div className="flex flex-row items-center justify-center w-full h-screen gap-5 font-medium">
      <Button variant={"default"}>
        <Link href={"/dashboard/opening"}>Opening Hours</Link>
      </Button>
      <Button variant={"default"}>
        <Link href={"/dashboard/menu"}>Menu</Link>
      </Button>
    </div>
  );
};

export default Dashboard;
