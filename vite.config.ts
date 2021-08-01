import dsv from '@rollup/plugin-dsv';
import reactRefresh from '@vitejs/plugin-react-refresh'

export default {
    plugins: [
        dsv(),
        reactRefresh()
    ]
}