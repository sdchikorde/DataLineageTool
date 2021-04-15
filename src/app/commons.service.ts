import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonsService {

  constructor() { }
  systems = [{"id": "sys000001", "name": "SYS Origin", "icto": "", "region": "", "poc": ["dummy1@gmail.com"]}, {"id": "sys000002", "name": "SYS Consumer", "icto": "", "region": "", "poc": ["dummy2@gmail.com"]}]
  feeds = [{"id": "fed000001", "name": "Sample Inbound feed", "direction": "inbound", "description": "", "filenameregex": "^sample_in.*$", "filenamesample": "", "gensysref": "sys000001", "consysref": [], "attributes": ""}, {"id": "fed000002", "name": "Sample Extract Feed", "direction": "outbound", "description": "", "filenameregex": "^extract_sample.*$", "filenamesample": "", "gensysref": "", "consysref": ["sys000002"], "attributes": ""}]
  operations = [{"id": "opr000001", "name": "Ingestion of Sample inbound feed", "type": "Ingestion", "description": "Ingestion operation", "jobname": "", "jobdatacenter": "", "frequency": "", "feedref": "fed000001", "tblviewref": [], "outputtblref": "tbl000001", "outputfeedref": null, "filter": "", "aggregate": "", "transpose": ""}, {"id": "opr000002", "name": "Transformation of sample feed data", "type": "Transformation", "description": "Transform operation", "jobname": "", "jobdatacenter": "", "frequency": "", "feedref": "", "tblviewref": ["tbl000001"], "outputtblref": "tbl000002", "outputfeedref": null, "filter": "", "aggregate": "", "transpose": ""}, {"id": "opr000003", "name": "Extraction of outbound feed", "type": "Extraction", "description": "Extract operation", "jobname": "", "jobdatacenter": "", "frequency": "", "feedref": "", "tblviewref": ["viw000001"], "outputtblref": "", "outputfeedref": "fed000002", "filter": "", "aggregate": "", "transpose": ""}]
  tables = [{"id": "tbl000001", "name": "staging_table", "schema": "myschema", "db": "mydb", "partitionInfo": "", "attributes": ""}, {"id": "tbl000002", "name": "final table", "schema": "myschema", "db": "mydb", "partitionInfo": "", "attributes": ""}]
  views = [{"id": "viw000001", "name": "sample_view", "schema": "myschema", "db": "mydb", "tblviewref": ["tbl000002"], "attributes": ""}]

  getNodeTypeById(id: string) {
    if (id.startsWith("sys")) {
      return "system";
    } else if (id.startsWith("fed")) {
      return "feed";
    } else if (id.startsWith("tbl")) {
      return "table";
    } else if (id.startsWith("opr")) {
      return "operation";
    } else if (id.startsWith("viw")) {
      return "view";
    }
  }
}
