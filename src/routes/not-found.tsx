import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
			<div className="space-y-6">
				<h1 className="text-4xl font-bold">404</h1>
				<p className="text-lg text-muted-foreground">
					Page not found. The link may be broken or the page may have been moved.
				</p>
				<div className="flex gap-4 justify-center">
					<Button asChild>
						<Link to="/">
							<Home className="mr-2 h-4 w-4" />
							Go Home
						</Link>
					</Button>
					<Button variant="outline" onClick={() => window.history.back()}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go Back
					</Button>
				</div>
			</div>
		</div>
	);
}
