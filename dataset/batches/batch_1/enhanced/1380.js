setcpm(126/4)

$: note("c5 a4 eb4 d4 a3 d5 c#5 c5 a4 eb5 d5 c#5 d5 eb5 d5 a4")
  .s("triangle").lpf(1800).release(.1).gain(.4)

$: s("white*16").release(.03).gain(.12)

$: note("<[d3,a3] [c3,a3]>").s("sawtooth").attack(.2).release(.4).lpf(800).room(.6).gain(.25)

$: s("bd ~ sd ~").bank("RolandTR909").gain(.8)

$: note("d2 ~ ~ d2 ~ ~ c2 ~").s("square").lpf(450).release(.15).gain(.5)
