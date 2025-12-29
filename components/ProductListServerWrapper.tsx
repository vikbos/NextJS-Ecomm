import { GetProductParams, getProducts } from "@/lib/actions";
import { ProductList } from "./product-list";
import { sleep } from "@/lib/utils";

interface ProductListServerWrapperProps {
    params: GetProductParams
}

export async function ProductListServerWrapper({ params }: ProductListServerWrapperProps) {
    await sleep(1000);
    const products = await getProducts(params);

    return <ProductList products={products} />
}