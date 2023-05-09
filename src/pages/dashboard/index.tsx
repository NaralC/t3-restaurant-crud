import { type NextPage } from "next";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const Dashboard: NextPage = () => {
  const { mutate } = api.admin.sensitive.useMutation();

  return (
    <div>
      dashboard
      <Button
        onClick={() => {
          mutate();
        }}
      >
        TOP SECRET DO NOT CLICK
      </Button>
    </div>
  );
};

export default Dashboard;
