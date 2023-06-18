import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.stream.Collectors;

public class Dh2Csv2Json {
	public static void main(String[] args) {
		String line = "";
		String[] parts = new String[0];
		try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(new File("C:\\java\\w40k\\src\\assets/dh2t.csv"))));) {
			line = br.readLine();
			while ((line = br.readLine()) != null) {
				parts = line.split("_");
				System.out.println("{\"tier\":" + parts[4].substring(1)//
						+ ",\"talent\":\"" + parts[0]//
						+ "\",\"prerequisites\":\"" + parts[1]//
						+ "\",\"apt1\":\"" + parts[2]//
						+ "\",\"apt2\":\"" + parts[3]//
						+ "\",\"benefit\":\"" + parts[5]//
						+ "\",\"ref\":\"" + parts[6]//
						+ "\"},");
			}
		} catch (Exception ex) {
			System.err.println(line);
			System.err.println(Arrays.stream(parts).collect(Collectors.joining(" --- ")));
			ex.printStackTrace();
		}
	}
}
