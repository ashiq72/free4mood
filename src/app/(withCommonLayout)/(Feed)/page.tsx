export default function Home() {
  return (
    <div>
      <div className="flex justify-between max-w-7xl mx-auto gap-4 ">
        <div className="border-2 border-amber-500 w-full flex-1">Left</div>
        <div className="border-2 border-amber-500 w-full flex-2">Middle</div>
        <div className="border-2 border-amber-500 w-full flex-1">Right</div>
      </div>
    </div>
  );
}
