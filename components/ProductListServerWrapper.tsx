import { GetProductParams, getProductsCached } from "@/lib/actions";
import { ProductList } from "./product-list";

interface ProductListServerWrapperProps {
    params: GetProductParams
}

export async function ProductListServerWrapper({ params }: ProductListServerWrapperProps) {
    const products = await getProductsCached(params);

    return <ProductList products={products} />
}