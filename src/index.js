import Display from "./display"

(async function () {
  let config = {
    pagemargins: {
      top:"0.5cm",
      bottom:"0.5cm",
      left:"1.5cm",
      right:"0.5cm"
    },
    pagesize:{
      width:"21cm",
      height:"29.7cm"
    },
    grids:{width:3,height:3},
    space:"0.5cm",
    linewidth:"0.1cm"
  }   
  let d = new Display("#root",config)
}) ();