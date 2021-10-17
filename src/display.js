import * as d3 from 'd3'
import * as unitsCss from "units-css"

export default class Display {
    constructor(root_elem_selector) {
        this.config = {}
        this.config.pagemargins = {
            top:unitsCss.convert("px","0.5cm"),
            bottom:unitsCss.convert("px","1.5cm"),
            left:unitsCss.convert("px","0.5cm"),
            right:unitsCss.convert("px","0.5cm")}
        this.config.pagesize = {
            width:unitsCss.convert("px","21cm"), 
            height:unitsCss.convert("px","29.7cm")
        }
        this.config.grids = {width:3,height:3}
        this.config.space = unitsCss.convert("px","0.5cm")
        this.config.linewidth = unitsCss.convert("px","0.1cm")     

        this.computed_config = {
            pageheight:this.config.pagesize.height -this.config.pagemargins.top - this.config.pagemargins.bottom,
            pagewidth:this.config.pagesize.width -this.config.pagemargins.left - this.config.pagemargins.right
        }


        this.elems = {}

        this.elems.page = d3.select(root_elem_selector).append("svg")
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

        this.elems.donwloadbutton = d3.select(root_elem_selector).append("button")
            this.elems.donwloadbutton
            .html("download")
            .on("click",()=>{
                this.export()
            })



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

        this.update_displayed_table()
        //we need an engine to have a data structure with table containing merged elements which is translated onto the display 
        //and the displayed elements have to be chekcable so that they can be merged/split

    }

    update_displayed_table() {
        //remove old elements
        this.elems.page.selectAll(".refreshable").remove()
        //calculations
        let base_cell_height = this.computed_config.pageheight/this.config.grids.height
        let base_cell_width = this.computed_config.pagewidth/this.config.grids.width
        //create new elements
        this.datagrid.nodes.forEach(elem => {
            let d3_rect = this.elems.page.append("rect")
            elem.d3_object = d3_rect
            d3_rect.attr("x",this.config.pagemargins.left+elem.grid_x*base_cell_width+this.config.space/2.0)
                .attr("y",this.config.pagemargins.top+elem.grid_y*base_cell_height+this.config.space/2.0)
                .attr("height",base_cell_height*elem.grid_height-this.config.space)
                .attr("width",base_cell_width*elem.grid_width-this.config.space)
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

//TODO: add edges - they should always connect two nodes, and only two
//  mergeability should be checked if the nodes have the matching x/y width/height depending on if they are horizontal/vertical

//TODO: make a proper git project out of it 