import Header from "@/components/Header";
import Store from "@/components/Store";

export default function StorePage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <Header />
      
      <div className="flex-1">
        <Store />
      </div>
    </div>
  );
}
