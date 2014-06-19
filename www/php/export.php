<?php
    $image = new Imagick();
    $started = false;
    foreach($_POST['charts'] as $chart){
        $subcharts = explode('</svg>',$chart);
        unset($subcharts[count($subcharts) - 1]);
        $i = 0;
        $image_loop = new Imagick();
        //echo '<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"></head><body>';
        while($i < count($subcharts)){
            $subcharts[$i] = $subcharts[$i] . '</svg>';
            
            ////////////////////////////////////////
            //clean the svg here
            
            $xdoc = new DOMDocument("1.0","utf-8");
            $xdoc->loadXML($subcharts[$i]);
            $textTags = $xdoc->getElementsByTagName('text');
            foreach($textTags as $textTag){
                //the php imagic is not rendering the direction of the arabic text properly
                if( strstr($textTag->getAttribute('class') , 'arabicText') != false ){
                    if( strstr($textTag->getAttribute('class') , 'bartext2') != false ){
                        //bartext2 is in topquerychartcomparison
                        $textTag->setAttribute('x',20);
                    }else if( strstr($textTag->getAttribute('class') , 'bartext') != false ){
                        //bartext is in topquerychart
                        $textTag->setAttribute('x',5);
                    }
                }
                if( strstr($textTag->getAttribute('class') , 'bartext2') != false ){
                    $textTag->setAttribute('y', 15);
                }
                $textTag->setAttribute('fill','black');
                
                
            }
            
            //the new saved document
            $subcharts[$i] = $xdoc->saveXML($xdoc->documentElement);
            $subcharts[$i] = '<?xml version="1.0" encoding="UTF-8" ?>' . $subcharts[$i];
            
            //echo $subcharts[$i];
            
            /////////////////////////////////////////////////
            //load the svg into image magic
            $image_loop->readImageBlob( $subcharts[$i] );
            //$geo_new = $image_loop->getimagegeometry();

            $i++;
        }
        
        $image_loop->resetIterator();
        $combined1 = $image_loop->appendimages(false);
        $image->addimage($combined1);
    }
    
    $combined1->setImageFormat("png24");
    
    
    $image->resetIterator();
    $combined = $image->appendImages(true);
    //$image->setimageformat("png24");
    $combined->setImageFormat("png24");
    
    //$image->resizeImage(1024, 768, imagick::FILTER_LANCZOS, 1); 
    //$im->resetIterator();
    //$combined = $im->appendImages(true);
    
    //$image->writeImage('export.png');
    
    header('Content-Description: File Transfer');
    header('Content-Type: application/force-download');
    header('Content-Disposition: attachment; filename=export.png');
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');
    //header('Content-Length: ' . count($image) );//flesize(%file)
    header("Content-Type: image/png");
    ob_clean();
    flush();
    
    //echo $image;
    echo $combined;
    
    //echo "export.png";
?>