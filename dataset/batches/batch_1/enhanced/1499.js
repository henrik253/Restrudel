setcpm(106/4)

$: s("sleighbells hh*4 ~ sd").gain(.28).room(.8).delay(.4)

$: s("bd ~ ~ bd ~ ~ sd ~").gain(.75)

$: note("f4 bb3 d3 f4 ~ a3 c4 f4 g3 bb3 d4 f4 ~ g3 bb3 ~").s("piano").release(.3).gain(.35).room(.4)

$: note("g1 ~ ~ g1 ~ ~ f1 ~").s("square").lpf(450).release(.2).gain(.5)
