import { useProjectControllerContext } from "@/context/ProjectControllerContext";
import { useSidebarControllerContext } from "@/context/SidebarControllerContext";

const useDashboard = () => {
  const {
    isLoading: { any: isLoadingDashBoard },
  } = useProjectControllerContext();
  const {
    isLoading: { any: isLoadingSidebar },
  } = useSidebarControllerContext();

  console.log(isLoadingDashBoard, isLoadingSidebar);

  return { isLoading: isLoadingSidebar || isLoadingDashBoard };
};

export default useDashboard;
