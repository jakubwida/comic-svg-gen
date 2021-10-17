export default class Datagrid{
    constructor(display){
        this.nodes = [{
            grid_x:0,
            grid_y:0,
            grid_width:display.config.grids.width,
            grid_height:display.config.grids.height,
            d3_object:null
        }]
        this.edges = []     
    }
    divide_node(node,dohorizontally,grid_pos) {
        console.log("divide node"+dohorizontally+" "+grid_pos)

        //removing old node
        let elemindex = this.nodes.indexOf(node)
        this.nodes.splice(elemindex,1)
        //inserting new nodes 
        if (dohorizontally) {
            let y1 = node.grid_y
            let x1 = node.grid_x 
            let height1 = grid_pos
            let width1 = node.grid_width

            let y2 = node.grid_y + grid_pos
            let x2 = node.grid_x 
            let height2 = node.grid_height - grid_pos
            let width2 = node.grid_width

            
            this.nodes.push({
                grid_x:x1,
                grid_y:y1,
                grid_width:width1,
                grid_height:height1,
                d3_object:null
            })
            this.nodes.push({
                grid_x:x2,
                grid_y:y2,
                grid_width:width2,
                grid_height:height2,
                d3_object:null
            })
        }
        else {
            let y1 = node.grid_y
            let x1 = node.grid_x 
            let height1 = node.grid_height
            let width1 = grid_pos

            let y2 = node.grid_y 
            let x2 = node.grid_x + grid_pos
            let height2 = node.grid_height 
            let width2 = node.grid_width - grid_pos

            this.nodes.push({
                grid_x:x1,
                grid_y:y1,
                grid_width:width1,
                grid_height:height1,
                d3_object:null
            })
            this.nodes.push({
                grid_x:x2,
                grid_y:y2,
                grid_width:width2,
                grid_height:height2,
                d3_object:null
            })
        }
    }

}