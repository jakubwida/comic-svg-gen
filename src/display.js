import * as d3 from 'd3'
import * as unitsCss from "units-css"

export default class Display {
    constructor(root_elem_selector,config) {
        this.root_elem_selector = root_elem_selector
        this._load_config(config)
        this._draw_basics()
        this._create_datagrid()
        this.update_displayed_table()
    }

    _create_datagrid() {
        this.datagrid = {}
        this.datagrid.nodes = [{
            grid_x:0,
            grid_y:0,
            grid_width:this.config.grids.width,
            grid_height:this.config.grids.height,
            d3_object:null
        }]
        this.datagrid.edges = []
        this.datagrid.divlines = []
    }

    _load_config(config){
        this.config = {}
        this.config.pagemargins = {
            top:unitsCss.convert("px",config.pagemargins.top),
            bottom:unitsCss.convert("px",config.pagemargins.bottom),
            left:unitsCss.convert("px",config.pagemargins.left),
            right:unitsCss.convert("px",config.pagemargins.right)}
        this.config.pagesize = {
            width:unitsCss.convert("px",config.pagesize.width), 
            height:unitsCss.convert("px",config.pagesize.height)
        }
        this.config.grids = {width:config.grids.width,height:config.grids.height}
        this.config.space = unitsCss.convert("px",config.space)
        this.config.linewidth = unitsCss.convert("px",config.linewidth)     

        this.computed_config = {
            pageheight:this.config.pagesize.height -this.config.pagemargins.top - this.config.pagemargins.bottom,
            pagewidth:this.config.pagesize.width -this.config.pagemargins.left - this.config.pagemargins.right
        }
    }

    _draw_basics(){
        this.elems = {}
        d3.select(this.root_elem_selector).selectAll().remove()
        this.elems.page = d3.select(this.root_elem_selector).append("svg")
        this.elems.page
            .attr("width",this.config.pagesize.width)
            .attr("height",this.config.pagesize.height)
            .style("outline","thin solid grey")
            .style("box-shadow","10px 10px 5px grey")
            .style("padding-left",this.config.pagemargins.left)
            .style("padding-right",this.config.pagemargins.right)
            .style("padding-top",this.config.pagemargins.top)
            .style("padding-bottom",this.config.pagemargins.bottom)             
        this.elems.comicpage = this.elems.page.append("rect")
        this.elems.comicpage
            .attr("x",this.config.pagemargins.left)
            .attr("y",this.config.pagemargins.top)
            .attr("height",this.computed_config.pageheight)
            .attr("width",this.computed_config.pagewidth)
            .attr("fill","none")
            .attr("stroke-width",1)
            .attr("stroke-dasharray","5,5")
            .attr("stroke","grey")

        this.elems.donwloadbutton = d3.select(this.root_elem_selector).append("button")
            this.elems.donwloadbutton
            .html("download")
            .on("click",()=>{
                this.export()
            })       
    }

    update_displayed_table() {
        //remove old elements
        this.elems.page.selectAll(".refreshable").remove()
        //calculations
        let base_cell_height = this.computed_config.pageheight/this.config.grids.height
        let base_cell_width = this.computed_config.pagewidth/this.config.grids.width
        //create new elements
        this.datagrid.nodes.forEach(elem => {

            let x = this.config.pagemargins.left+elem.grid_x*base_cell_width+this.config.space/2.0
            let y = this.config.pagemargins.top+elem.grid_y*base_cell_height+this.config.space/2.0
            let height = base_cell_height*elem.grid_height-this.config.space
            let width = base_cell_width*elem.grid_width-this.config.space
            //if this is uncommented, the edges will fit the page - but Im not so fond of it
            /*
            if (elem.grid_x == 0) {
                x -= this.config.space/2.0
                width += this.config.space/2.0
            }
            if (elem.grid_y == 0) {
                y -= this.config.space/2.0
                height += this.config.space/2.0
            }
            if (elem.grid_x+elem.grid_width == this.config.grids.width) {
                width += this.config.space/2.0
            }
            if (elem.grid_y+elem.grid_height == this.config.grids.height) {
                height += this.config.space/2.0
            }
            */
            let d3_rect = this.elems.page.append("rect")
            elem.d3_object = d3_rect
            d3_rect.attr("x",x)
                .attr("y",y)
                .attr("height",height)
                .attr("width",width)
                .attr("fill","none")
                .attr("stroke-width",this.config.linewidth)
                .attr("stroke","black")
                .attr("class", "refreshable exportable")
            //appending subdivision lines to the element:
            //vertical
            for (let i = 1; i < elem.grid_width; i++) {
                 let xpos = this.config.pagemargins.left+(i+elem.grid_x)*base_cell_width
                 let ypos = this.config.pagemargins.top+elem.grid_y*base_cell_height+this.config.space/2.0
                 let length = base_cell_height*elem.grid_height-this.config.space
                 let divline = this.elems.page.append("line")
                 this.datagrid.divlines.push(divline)
                 divline.attr("x1",xpos)
                    .attr("x2",xpos)
                    .attr("y1",ypos)
                    .attr("y2",ypos+length)
                    .attr("stroke","grey")
                    .attr("stroke-width",3)
                    .attr("class", "refreshable nonexportable")
                    .on("click",()=>{
                        this.divide_node(elem,false,i)
                    })
                    .on("mouseover",function(){
                        d3.select(this).attr("stroke-width",4)
                    })   
                    .on("mouseout",function(){
                        d3.select(this).attr("stroke-width",3)
                    })        
            }
            //horizontal
            for (let i = 1; i < elem.grid_height; i++) {
                let ypos = this.config.pagemargins.top+(i+elem.grid_y)*base_cell_height
                let xpos = this.config.pagemargins.left+elem.grid_x*base_cell_width+this.config.space/2.0
                let length = base_cell_width*elem.grid_width-this.config.space
                let divline = this.elems.page.append("line")
                this.datagrid.divlines.push(divline)
                divline.attr("x1",xpos)
                   .attr("x2",xpos+length)
                   .attr("y1",ypos)
                   .attr("y2",ypos)
                   .attr("stroke","grey")
                   .attr("stroke-width",3)
                   .attr("class", "refreshable nonexportable")
                   .on("click",()=>{
                        this.divide_node(elem,true,i)
                    })  
                    .on("mouseover",function(){
                        d3.select(this).attr("stroke-width",4)
                    })   
                    .on("mouseout",function(){
                        d3.select(this).attr("stroke-width",3)
                    })                    
           }            
        });   
        //TODO edges     
    }

    divide_node(node,dohorizontally,grid_pos) {
        console.log("divide node"+dohorizontally+" "+grid_pos)

        //removing old node
        let elemindex = this.datagrid.nodes.indexOf(node)
        this.datagrid.nodes.splice(elemindex,1)
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

            
            this.datagrid.nodes.push({
                grid_x:x1,
                grid_y:y1,
                grid_width:width1,
                grid_height:height1,
                d3_object:null
            })
            this.datagrid.nodes.push({
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

            this.datagrid.nodes.push({
                grid_x:x1,
                grid_y:y1,
                grid_width:width1,
                grid_height:height1,
                d3_object:null
            })
            this.datagrid.nodes.push({
                grid_x:x2,
                grid_y:y2,
                grid_width:width2,
                grid_height:height2,
                d3_object:null
            })
        }
        //TODO edges
        console.log(this.datagrid.nodes)
        this.update_displayed_table()
    }

    export(){
        this.elems.page.selectAll(".nonexportable").remove()
        var svgnode = this.elems.page.node().parentNode.innerHTML
        var blob = new Blob([svgnode], {type: "image/svg+xml"});
        var url = window.URL.createObjectURL(blob);
        var link = d3.select("#root").append("a")
        link.attr("href",url)
            .attr("download","file.svg")
        link.node().click()
        link.remove()
        this.update_displayed_table()
    }
}

//TODO: 
//  1. add edges - they should always connect two nodes, and only two
//      mergeability should be checked if the nodes have the matching x/y width/height depending on if they are horizontal/vertical
//  2. split constructor  into proper re-launchable classes/functions <so that config can be changed and stuff be reloaded>
//  3. nake edge cells fit into the page frame (without spaces)
//  4. create a display with 