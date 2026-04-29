
interface CreateShopProps {
    sellerId: string;
    setActiveStep: (step: number) => void;
}

const CreateShop = ({ sellerId, setActiveStep }: CreateShopProps) => {
    return (
        <div>create-shop</div>
    )
}

export default CreateShop