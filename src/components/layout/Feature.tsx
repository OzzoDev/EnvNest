type FeatureProps = {
  headline: string;
  text: string;
};

const Feature = ({ headline, text }: FeatureProps) => {
  return (
    <div className="flex flex-col gap-8 border rounded-md p-8 h-full w-full">
      <h2 className="text-xl text-primary">{headline}</h2>
      <p className="text-base text-text-color">{text}</p>
    </div>
  );
};

export default Feature;
