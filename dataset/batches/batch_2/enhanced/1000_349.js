setcpm(100/4)
$: s("bd ~ ~ bd ~ cp ~ ~").bank("RolandTR808").gain(.8)
$: s("hh*8").gain(.2)
$: note("c2 c2 g1 c2").sound("drum").lpf(400).room(.5684).gain(.4).release(.05)
